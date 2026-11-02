/* SpeakBack: instant IELTS Speaking feedback for a submitted free answer.
   POST { idToken, sid, lesson, i, part, q, hint, transcript, seconds }
   - verifies the Firebase ID token (project speakback-522aa) and that the email belongs to a student (data/lessons.json) or a teacher
   - asks Claude for feedback by the 4 IELTS criteria, returns JSON in the shape the web renders
   Needs the Cloudflare Pages secret ANTHROPIC_API_KEY. */
const PROJECT = "speakback-522aa";
const TEACHERS = ["phqa8899@gmail.com"];
const MODEL = "claude-sonnet-5-5";
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
  const email = (user.email || "").toLowerCase();
  const data = await (await fetch(new URL("/data/lessons.json", request.url))).json();
  const S = (data.students || []).find(s => (s.emails || []).some(e => e.toLowerCase() === email));
  if (!S && !TEACHERS.includes(email)) return json({ error: "Gmail này chưa có trong lớp." }, 403);
  const transcript = String(req.transcript || "").slice(0, 4000).trim();
  if (!transcript) return json({ error: "Máy chưa nghe được gì, em ghi âm lại nha." }, 400);
  const level = ((S || {}).profile || {}).level || "";
  const user_msg = `Học sinh: ${S ? S.name : "giáo viên thử"}. Trình độ: ${level || "chưa rõ"}.
Phần thi: ${req.part || "Part 1"}. Câu hỏi: ${String(req.q || "").slice(0, 600)}
Từ gợi ý nên dùng: ${String(req.hint || "").slice(0, 400)}
Thời lượng ghi âm: ${Number(req.seconds) || "?"} giây.
Bản chép lời: """${transcript}"""`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env.FEEDBACK_MODEL || MODEL, max_tokens: 1500, system: SYSTEM, messages: [{ role: "user", content: user_msg }] }),
  });
  if (!r.ok) return json({ error: "Máy nhận xét đang bận, em thử lại sau ít phút nha.", detail: r.status }, 502);
  const out = await r.json();
  const text = (out.content || []).map(c => c.text || "").join("");
  let fb;
  try { fb = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); } catch { return json({ error: "Máy trả lời lỗi, em nộp lại nha." }, 502); }
  return json({ ...fb, said: transcript, auto: true });
}
