/* SpeakBack: chấm PHÁT ÂM từng âm cho thẻ câu mẫu (shadowing, final sounds…) bằng Azure Pronunciation Assessment.

   Khác /api/feedback (Claude, tốn credit): phần này dùng Azure Speech gói Free F0 (~5 giờ audio/tháng, không gắn thẻ).
   Hết 5 giờ thì Azure tự từ chối tới tháng sau (KHÔNG trừ tiền) → web tự quay về Whisper trên máy HS.
   Chưa cài key → GET trả { enabled:false } và web chạy Whisper như cũ.

   Lượt: mỗi HS PER_DAY lượt/ngày, ngày không dùng thì cộng dồn sang ngày sau trong cùng tuần (tuần bắt đầu Thứ Hai, giờ VN).
   Đếm ở Firestore users/{uid}/takes/_pronquota. Chỉ trừ lượt khi Azure chấm xong.
   Audio: WAV 16 kHz mono 16-bit, tối đa MAX_SEC giây (web đã cắt khoảng lặng đầu/cuối).

   GET                                   → { enabled }
   POST ?lesson=<id>&i=<n>  (body = WAV, header x-id-token)
        → { words:[{w,acc,err,ph:[{p,acc}]}], scores:{acc,flu,comp,pron,pros}, quota:{left,day} }

   Cloudflare Pages secrets: AZURE_SPEECH_KEY (bắt buộc) · AZURE_SPEECH_REGION (mặc định southeastasia). */
const PROJECT = "speakback-522aa";
const TEACHERS = ["phqa8899@gmail.com"];
const PER_DAY = 60, MAX_SEC = 15;
const FS = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents";
const JWK_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8" } });
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const b64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));

async function verify(token) {
  const [h, p, sig] = (token || "").split(".");
  if (!sig) throw new Error("token");
  const head = JSON.parse(new TextDecoder().decode(b64u(h))), body = JSON.parse(new TextDecoder().decode(b64u(p)));
  const keys = (await (await fetch(JWK_URL, { cf: { cacheTtl: 3600 } })).json()).keys;
  const jwk = keys.find(k => k.kid === head.kid);
  if (!jwk || head.alg !== "RS256") throw new Error("kid");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(sig), new TextEncoder().encode(h + "." + p));
  if (!ok || body.aud !== PROJECT || body.iss !== "https://securetoken.google.com/" + PROJECT || body.exp < Date.now() / 1000) throw new Error("claims");
  return body;
}

/* giờ Việt Nam: tuần bắt đầu Thứ Hai; day = 0 (T2) … 6 (CN) */
function vnWeek(d = new Date()) {
  const t = new Date(d.getTime() + 7 * 3600e3); t.setUTCHours(0, 0, 0, 0);
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day);
  return { week: t.toISOString().slice(0, 10), day };
}
async function readQuota(uid, tok) {
  const { week } = vnWeek();
  const r = await fetch(`${FS}/users/${uid}/takes/_pronquota`, { headers: { authorization: "Bearer " + tok } });
  if (r.status === 404) return { week, n: 0 };
  if (!r.ok) throw new Error("quota " + r.status);
  const f = (await r.json()).fields || {};
  const q = JSON.parse((f.q && f.q.stringValue) || "{}");
  if (q.week !== week) return { week, n: 0 };
  q.n = q.n || 0;
  return q;
}
async function writeQuota(uid, tok, q) {
  const body = { fields: { lesson: { stringValue: "_quota" }, kind: { stringValue: "quota" }, q: { stringValue: JSON.stringify(q) } } };
  const r = await fetch(`${FS}/users/${uid}/takes/_pronquota`, { method: "PATCH", headers: { authorization: "Bearer " + tok, "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error("quota write " + r.status);
}
const allowance = () => PER_DAY * (vnWeek().day + 1);   // cộng dồn: T2 = 60, T3 = 120, …

/* câu mẫu trong lessons.json → câu đọc thường cho Azure (bỏ dấu / ==  ++ !! ** ‿) */
function refText(t) {
  return String(t || "").replace(/==|\+\+|!!|\*\*|‿/g, " ").replace(/\//g, " ").replace(/\.{3}/g, " ").replace(/\s+/g, " ").trim();
}

async function azure(env, wav, ref, prosody) {
  const region = env.AZURE_SPEECH_REGION || "southeastasia";
  const cfg = { ReferenceText: ref, GradingSystem: "HundredMark", Granularity: "Phoneme", Dimension: "Comprehensive", EnableMiscue: true, PhonemeAlphabet: "IPA" };
  if (prosody) cfg.EnableProsodyAssessment = true;
  return fetch(`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY, "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000", "Pronunciation-Assessment": b64(JSON.stringify(cfg)), Accept: "application/json" },
    body: wav,
  });
}

export async function onRequestGet({ env }) {
  return json({ enabled: !!env.AZURE_SPEECH_KEY, perDay: PER_DAY });
}

export async function onRequestPost({ request, env }) {
  if (!env.AZURE_SPEECH_KEY) return json({ error: "off", off: true }, 503);
  const url = new URL(request.url), tok = request.headers.get("x-id-token");
  let user;
  try { user = await verify(tok); } catch { return json({ error: "Em đăng nhập lại Gmail nha.", fallback: true }, 401); }
  const email = (user.email || "").toLowerCase(), uid = user.user_id || user.sub;
  const data = await (await fetch(new URL("/data/lessons.json", request.url))).json();
  const S = (data.students || []).find(s => (s.emails || []).some(e => e.toLowerCase() === email));
  const teacher = TEACHERS.includes(email);
  if (!S && !teacher) return json({ error: "Gmail này chưa có trong lớp.", fallback: true }, 403);
  const L = (data.lessons || []).find(x => x.id === url.searchParams.get("lesson"));
  const C = L && (L.sentences || [])[Number(url.searchParams.get("i"))];
  if (!C || C.free || L.type === "gap" || (S && !teacher && !(L.for || []).includes(S.id))) return json({ error: "Câu này không chấm kỹ được.", fallback: true }, 400);
  const wav = await request.arrayBuffer();
  if (wav.byteLength < 8000 || wav.byteLength > 44 + MAX_SEC * 32000) return json({ error: "Đoạn ghi âm quá ngắn hoặc quá dài.", fallback: true }, 400);
  let q;
  try { q = await readQuota(uid, tok); } catch { return json({ error: "Chưa kiểm tra được lượt chấm.", fallback: true }, 502); }
  const left = allowance() - q.n;
  if (left <= 0) return json({ error: "limit", limit: true, fallback: true, quota: { left: 0, day: PER_DAY } }, 429);

  const ref = refText(C.text);
  let r = await azure(env, wav, ref, true);
  if (r.status === 400) r = await azure(env, wav, ref, false);   // vùng/ngôn ngữ chưa hỗ trợ ngữ điệu → chấm không có prosody
  if (r.status === 401 || r.status === 403 || r.status === 429)
    return json({ error: "pool", pool: true, fallback: true, detail: r.status }, 503);   // hết 5 giờ miễn phí của tháng, hoặc key sai
  if (!r.ok) return json({ error: "azure", fallback: true, detail: r.status }, 502);
  const out = await r.json();
  const nb = (out.NBest || [])[0];
  if (out.RecognitionStatus !== "Success" || !nb) return json({ error: "nomatch", nomatch: true, fallback: false }, 200);

  const pa = nb.PronunciationAssessment || nb;
  const words = (nb.Words || []).map(w => {
    const a = w.PronunciationAssessment || w;
    return { w: w.Word, acc: Math.round(a.AccuracyScore ?? 0), err: a.ErrorType || "None",
      ph: (w.Phonemes || []).map(p => ({ p: p.Phoneme, acc: Math.round((p.PronunciationAssessment || p).AccuracyScore ?? 0) })) };
  });
  q.n += 1;
  try { await writeQuota(uid, tok, q); } catch (e) { console.error(e); }
  return json({
    words, display: nb.Display || "",
    scores: { acc: pa.AccuracyScore, flu: pa.FluencyScore, comp: pa.CompletenessScore, pron: pa.PronScore, pros: pa.ProsodyScore ?? null },
    quota: { left: left - 1, day: PER_DAY },
  });
}
