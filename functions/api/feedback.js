/* SpeakBack: instant IELTS Speaking feedback for a submitted free answer.

   ===== ĐÂY LÀ PHẦN DUY NHẤT CỦA SPEAKBACK DÙNG API KEY (TỐN TIỀN) =====
   Chỉ chạy khi HS bấm "📤 Nộp bài" ở THẺ TỰ TRẢ LỜI ("free": true trong data/lessons.json: Part 1/2/3 tự nói).
   KHÔNG dùng API (miễn phí, chạy trên máy HS hoặc file có sẵn):
     ghi âm, chấm điểm từng từ ở thẻ câu mẫu, âm cuối, shadowing (Whisper trong trình duyệt) ·
     nghe chép / điền từ (so chữ trên máy) · audio Mindset, video TTS (file có sẵn) ·
     khung "Em đang ở đâu", màn giáo viên, tải bài nộp · nhận xét giáo viên duyệt (đọc từ lessons.json).
   Đừng gọi /api/feedback từ chỗ nào khác.

   Chặn lố budget (credit trả trước 5 USD, Sonnet 5.5 ≈ 0.011 USD / lần chấm):
     - chỉ nhận thẻ có "free": true của bài giao cho đúng HS đó; câu hỏi lấy từ lessons.json, không lấy từ trình duyệt
     - mỗi câu tối đa PER_CARD lần chấm, mỗi HS tối đa PER_WEEK lần / tuần (đếm ở Firestore users/{uid}/takes/_aiquota)
     - bản chép lời tối đa 2500 ký tự, trả lời tối đa 1200 token
   POST { idToken, lesson, i, transcript, seconds } → feedback JSON + quota { card, cardMax, week, weekMax }
   Needs the Cloudflare Pages secret ANTHROPIC_API_KEY. */
const PROJECT = "speakback-522aa";
const TEACHERS = ["phqa8899@gmail.com"];
const MODEL = "claude-sonnet-5-5";
const PER_CARD = 3, PER_WEEK = 15, TEACHER_WEEK = 10;
const FS = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents";
const JWK_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8" } });
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));

async function verify(token) {
  const [h, p, sig] = (token || "").split(".");
  if (!sig) throw new Error("token");
  const head = JSON.parse(new TextDecoder().decode(b64u(h))), body = JSON.parse(new TextDecoder().decode(b64u(p)));
  const keys = (await (await fetch(JWK_URL, { cf: { cacheTtl: 3600 } })).json()).keys;
  const jwk = keys.find(k => k.kid === head.kid);
  if (!jwk || head.alg !== "RS256") throw new Error("kid");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(sig), new TextEncoder().encode(h + "." + p));
  const now = Date.now() / 1000;
  if (!ok || body.aud !== PROJECT || body.iss !== "https://securetoken.google.com/" + PROJECT || body.exp < now) throw new Error("claims");
  return body;
}

function weekId(d = new Date()) {   // tuần tính theo giờ Việt Nam, bắt đầu Thứ Hai
  const t = new Date(d.getTime() + 7 * 3600e3); t.setUTCHours(0, 0, 0, 0);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t.toISOString().slice(0, 10);
}
async function readQuota(uid, tok) {
  const r = await fetch(`${FS}/users/${uid}/takes/_aiquota`, { headers: { authorization: "Bearer " + tok } });
  if (r.status === 404) return { week: weekId(), n: 0, cards: {} };
  if (!r.ok) throw new Error("quota " + r.status);
  const f = ((await r.json()).fields || {});
  const q = JSON.parse((f.q && f.q.stringValue) || "{}");
  if (q.week !== weekId()) { q.week = weekId(); q.n = 0; }
  q.cards = q.cards || {}; q.n = q.n || 0;
  return q;
}
async function writeQuota(uid, tok, q) {
  const body = { fields: { lesson: { stringValue: "_quota" }, kind: { stringValue: "quota" }, q: { stringValue: JSON.stringify(q) } } };
  const r = await fetch(`${FS}/users/${uid}/takes/_aiquota`, { method: "PATCH", headers: { authorization: "Bearer " + tok, "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error("quota write " + r.status);
}

const SYSTEM = `Bạn là giáo viên IELTS Speaking người Việt, nhận xét bài nói của học sinh lớp luyện thi. Xưng "chị", gọi học sinh là "em", tiếng Việt ngắn gọn, thân thiện, cụ thể.
Chấm theo 4 tiêu chí IELTS (band descriptors công khai): Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation.
Bài chỉ có BẢN CHÉP LỜI do máy nghe (Whisper), máy có thể tự sửa lỗi nhẹ: KHÔNG kết luận lỗi phát âm từ bản chép, trừ khi từ bị chép thành từ khác hẳn và vô nghĩa trong câu. Band là ƯỚC LƯỢNG (bước .5), không phải điểm chính thức.
Quy tắc:
- good: 1–2 điểm mạnh cụ thể (trích từ/cụm em dùng tốt, hoặc cách triển khai ý).
- fix: tối đa 3 lỗi quan trọng nhất (ưu tiên sai nghĩa > ngữ pháp lặp lại > từ chưa tự nhiên). err = cụm em nói, fix = cụm đúng (tiếng Anh – Mỹ), why = lý do ngắn bằng tiếng Việt, có tên tiêu chí (LR/GRA/FC).
- tips: 1–2 cách khắc phục làm được ngay.
- better: bản nâng cấp GIỮ Ý của em, cao hơn trình độ hiện tại 0.5–1 band, tiếng Anh – Mỹ, độ dài theo phần thi (Part 1: 3–4 câu; Part 2: 8–12 câu; Part 3: 4–6 câu).
- redo: 1 câu nhắc em ghi âm lại phần nào (hoặc "" nếu bài đã tốt).
- Nếu bản chép quá ngắn, lạc đề hoặc không phải tiếng Anh: band "", good [], fix [], tips nhắc em nói lại đúng yêu cầu.
Chỉ trả về JSON hợp lệ, không markdown: {"band":"5.5","good":[...],"fix":[{"err":"","fix":"","why":""}],"tips":[...],"better":"","redo":""}`;

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "Chưa cài API key." }, 503);
  let req;
  try { req = await request.json(); } catch { return json({ error: "bad request" }, 400); }
  let user;
  try { user = await verify(req.idToken); } catch (e) { return json({ error: "Em đăng nhập lại Gmail rồi nộp lại nha." }, 401); }
  const email = (user.email || "").toLowerCase(), uid = user.user_id || user.sub;
  const data = await (await fetch(new URL("/data/lessons.json", request.url))).json();
  const S = (data.students || []).find(s => (s.emails || []).some(e => e.toLowerCase() === email));
  const teacher = TEACHERS.includes(email);
  if (!S && !teacher) return json({ error: "Gmail này chưa có trong lớp." }, 403);
  // only a free-answer card of a lesson assigned to this student
  const L = (data.lessons || []).find(x => x.id === req.lesson);
  const C = L && (L.sentences || [])[Number(req.i)];
  if (!C || !C.free || (S && !(L.for || []).includes(S.id))) return json({ error: "Câu này không có chấm tự động." }, 400);
  const transcript = String(req.transcript || "").slice(0, 2500).trim();
  if (transcript.split(/\s+/).length < 5) return json({ error: "Máy nghe được quá ít chữ, em ghi âm lại rõ hơn rồi nộp nha (chưa tính lượt)." }, 400);
  // budget guard
  const cardKey = `${L.id}~${Number(req.i)}`, weekMax = teacher ? TEACHER_WEEK : PER_WEEK;
  let q;
  try { q = await readQuota(uid, req.idToken); } catch (e) { return json({ error: "Chưa kiểm tra được lượt chấm, em thử lại sau ít phút nha." }, 502); }
  const used = q.cards[cardKey] || 0;
  const quota = { card: used, cardMax: PER_CARD, week: q.n, weekMax };
  if (used >= PER_CARD) return json({ error: `Câu này em đã dùng hết ${PER_CARD} lượt máy chấm. Bài đã nộp vẫn được lưu, chị sẽ nghe và chấm sau nha.`, quota, limit: true }, 429);
  if (q.n >= weekMax) return json({ error: `Tuần này em đã dùng hết ${weekMax} lượt máy chấm (mở lại Thứ Hai). Bài đã nộp vẫn được lưu, chị sẽ chấm sau nha.`, quota, limit: true }, 429);
  const level = ((S || {}).profile || {}).level || "";
  const part = C.part || ((/part\s*([23])/i.exec(C.label || "") || [])[1] ? "Part " + /part\s*([23])/i.exec(C.label)[1] : "Part 1");
  const user_msg = `Học sinh: ${S ? S.name : "giáo viên thử"}. Trình độ: ${level || "chưa rõ"}.
Phần thi: ${part}. Câu hỏi: ${String(C.q || "").slice(0, 600)}
Từ gợi ý nên dùng: ${String(C.hint || "").slice(0, 400)}
Thời lượng ghi âm: ${Number(req.seconds) || "?"} giây.
Bản chép lời: """${transcript}"""`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env.FEEDBACK_MODEL || MODEL, max_tokens: 1200, system: SYSTEM, messages: [{ role: "user", content: user_msg }] }),
  });
  if (!r.ok) return json({ error: r.status === 400 && (await r.text()).includes("credit") ? "Máy chấm tạm hết lượt của lớp, chị sẽ chấm tay nha." : "Máy nhận xét đang bận, em thử lại sau ít phút nha.", detail: r.status }, 502);
  const out = await r.json();
  const text = (out.content || []).map(c => c.text || "").join("");
  let fb;
  try { fb = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); } catch { return json({ error: "Máy trả lời lỗi, em nộp lại nha." }, 502); }
  q.cards[cardKey] = used + 1; q.n += 1;
  try { await writeQuota(uid, req.idToken, q); } catch (e) { console.error(e); }
  return json({ ...fb, said: transcript, auto: true, quota: { card: used + 1, cardMax: PER_CARD, week: q.n, weekMax } });
}
