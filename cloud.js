/* SpeakBack cloud sync: Google sign-in + Firestore, so progress follows the student to any device.
   Config lives in firebase-config.json (the public web-app config from the Firebase console).
   No config file, or an empty one → window.Cloud stays disabled and the site keeps saving on this device only.

   Firestore layout: users/{uid} = { email, name, student, best: { <lessonId>: { <sentenceIndex>: score } }, updatedAt } */
const V = "10.14.1";
const base = `https://www.gstatic.com/firebasejs/${V}`;

const Cloud = {
  enabled: false, user: null, profile: null,
  _listeners: [], _db: null, _auth: null, _fs: null, _au: null, _pending: {}, _timer: null,
  onChange(fn) { this._listeners.push(fn); },
  _emit() { this._listeners.forEach(fn => { try { fn(this.user, this.profile); } catch (e) { console.error(e); } }); },
  async signIn() {
    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = this._au;
    const p = new GoogleAuthProvider();
    p.setCustomParameters({ prompt: "select_account" });
    try { await signInWithPopup(this._auth, p); }
    catch (e) {
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(e.code)) return signInWithRedirect(this._auth, p);
      if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") throw e;
    }
  },
  async signOut() { await this._au.signOut(this._auth); },
  /* merge fields into this user's document (nested objects are merged, not replaced) */
  async save(patch) {
    if (!this.user) return;
    const { doc, setDoc, serverTimestamp } = this._fs;
    await setDoc(doc(this._db, "users", this.user.uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
  },
  /* batch progress writes: many sentences in a row become one write */
  saveBest(lessonId, best) {
    if (!this.user) return;
    this._pending[lessonId] = best;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.flush(), 1500);
  },
  /* teachers only (Firestore rules refuse everyone else): every user's progress document */
  async listUsers() {
    const { collection, getDocs } = this._fs;
    const snap = await getDocs(collection(this._db, "users"));
    return snap.docs.map(d => { const x = d.data(); return { uid: d.id, ...x, updatedAt: x.updatedAt && x.updatedAt.toDate ? x.updatedAt.toDate() : null }; });
  },
  async flush() {
    const p = this._pending; this._pending = {};
    if (!Object.keys(p).length || !this.user) return;
    try { await this.save({ best: p }); }
    catch (e) { console.error("cloud save failed", e); Object.assign(this._pending, p, this._pending); }
  },
};
window.Cloud = Cloud;

try {
  const cfg = await fetch("firebase-config.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null);
  if (cfg && cfg.apiKey) {
    const [{ initializeApp }, au, fs] = await Promise.all([
      import(`${base}/firebase-app.js`), import(`${base}/firebase-auth.js`), import(`${base}/firebase-firestore.js`)]);
    const app = initializeApp(cfg);
    Cloud._au = au; Cloud._fs = fs;
    Cloud._auth = au.getAuth(app);
    Cloud._db = fs.getFirestore(app);
    Cloud.enabled = true;
    au.getRedirectResult(Cloud._auth).catch(() => {});
    au.onAuthStateChanged(Cloud._auth, async u => {
      Cloud.user = u; Cloud.profile = null;
      if (u) {
        try {
          const snap = await fs.getDoc(fs.doc(Cloud._db, "users", u.uid));
          Cloud.profile = snap.exists() ? snap.data() : {};
          if (!snap.exists()) await Cloud.save({ email: u.email || "", name: u.displayName || "", best: {} });
        } catch (e) {
          console.error("cloud load failed", e);
          Cloud.profile = { _error: e.code || String(e) };
        }
      }
      Cloud._emit();
    });
    window.addEventListener("pagehide", () => Cloud.flush());
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") Cloud.flush(); });
  }
} catch (e) { console.error("cloud init failed", e); }
Cloud.ready = true;
window.dispatchEvent(new Event("cloud-ready"));
