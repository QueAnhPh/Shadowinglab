/* Chuyển tiếp POST /v1/messages tới Claude API từ máy chủ Mỹ. Chỉ dùng cho nhận xét nhanh SpeakBack (functions/api/feedback.js). */
export default {
  async fetch(req) {
    const u = new URL(req.url);
    if (req.method !== "POST" || u.pathname !== "/v1/messages") return new Response("not found", { status: 404 });
    const h = new Headers();
    for (const k of ["x-api-key", "anthropic-version", "content-type"]) { const v = req.headers.get(k); if (v) h.set(k, v); }
    if (!h.get("x-api-key")) return new Response("no key", { status: 401 });
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: h, body: await req.text() });
    return new Response(r.body, { status: r.status, headers: { "content-type": r.headers.get("content-type") || "application/json", "x-relay-colo": (req.cf && req.cf.colo) || "" } });
  },
};
