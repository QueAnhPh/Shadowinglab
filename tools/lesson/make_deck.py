#!/usr/bin/env python3
"""Build a SpeakBack flashcard deck from a pipe-separated card list and merge it into data/lessons.json.

Card file format (UTF-8):
  #id=dt3  #title=…  #session=3  #topic=…        header lines
  @Section name                                   section (shown as a small tag on the card)
  = meaning shared by the group | note (optional)  starts a card = 1 group of synonyms / near-synonyms
  w|type|ipa|stress|band|grammar|ex               one word of the group (7 fields)
  w|type|ipa|stress|band|mean|grammar|ex          old flat line (8 fields) = a card with 1 word
type: Vocab · Phrasal verb · Collocation · Idiom · band: 3–3.5 · 4–5 · 5.5–6.5 · 7–8 · 8.5–9 (8.5–9 gets ⚠).
A group holds words that fit the same sentence; at most 8 words, at most 3 per type.

Output card: {"mean", "note"?, "cat", "items": [{w, type, ipa, stress, band, grammar, ex, warn?}]}

Usage: make_deck.py <cards.txt> <lessons.json> --for duc,thu [--opens YYYY-MM-DD] [--link lessonId,…]
"""
import argparse, json, sys
from collections import Counter
TYPES = ["Vocab", "Phrasal verb", "Collocation", "Idiom"]
BANDS = {"3–3.5", "4–5", "5.5–6.5", "7–8", "8.5–9"}

def item(path, n, w, t, ipa, st, band, gr, ex):
    if t not in TYPES: sys.exit(f"{path}:{n}: type lạ {t!r}")
    if band not in BANDS: sys.exit(f"{path}:{n}: band lạ {band!r}")
    it = {"w": w, "type": t, "ipa": ipa, "stress": st, "band": band, "grammar": gr, "ex": ex}
    if band == "8.5–9": it["warn"] = True
    return it

def parse(path):
    meta, cards, sec, cur = {}, [], "", None
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        line = line.rstrip("\n")
        if not line.strip(): continue
        if line.startswith("#"):
            k, _, v = line[1:].partition("="); meta[k.strip()] = v.strip(); continue
        if line.startswith("@"): sec = line[1:].strip(); cur = None; continue
        if line.startswith("="):
            mean, _, note = line[1:].partition("|")
            cur = {"mean": mean.strip(), "cat": sec, "items": []}
            if note.strip(): cur["note"] = note.strip()
            cards.append(cur); continue
        f = [x.strip() for x in line.split("|")]
        if len(f) == 8:
            w, t, ipa, st, band, mean, gr, ex = f
            cards.append({"mean": mean, "cat": sec, "items": [item(path, n, w, t, ipa, st, band, gr, ex)]}); cur = None
        elif len(f) == 7:
            if cur is None: sys.exit(f"{path}:{n}: dòng 7 cột phải nằm dưới 1 dòng '= nghĩa'")
            cur["items"].append(item(path, n, *f))
        else:
            sys.exit(f"{path}:{n}: cần 7 cột (trong nhóm) hoặc 8 cột (thẻ lẻ), có {len(f)}")
    seen = set()
    for c in cards:
        if not c["items"]: sys.exit(f"nhóm rỗng: {c['mean']}")
        if len(c["items"]) > 8: sys.exit(f"nhóm quá 8 từ: {c['mean']}")
        over = [t for t, k in Counter(i["type"] for i in c["items"]).items() if k > 3]
        if over: print(f"⚠ nhóm '{c['mean']}' có >3 từ loại {over}: hàng sẽ dài")
        for i in c["items"]:
            k = i["w"].lower()
            if k in seen: sys.exit(f"trùng từ: {i['w']}")
            seen.add(k)
    means = [c["mean"] for c in cards]
    dup = {m for m in means if means.count(m) > 1}
    if dup: sys.exit(f"nghĩa trùng giữa các thẻ (đoán nghĩa sẽ sai): {dup}")
    return meta, cards

ap = argparse.ArgumentParser()
ap.add_argument("cards"); ap.add_argument("lessons")
ap.add_argument("--for", dest="who", required=True)
ap.add_argument("--opens"); ap.add_argument("--link", default="")
a = ap.parse_args()
meta, cards = parse(a.cards)
deck = {"id": meta["id"], "title": meta["title"], "session": int(meta["session"]), "for": a.who.split(",")}
# deck.topic left out on purpose: weekly lessons use "📅 Tuần …" topics, and web matches decks by session when topic differs
if a.opens: deck["opens"] = a.opens
deck["cards"] = cards
d = json.load(open(a.lessons, encoding="utf-8"))
ds = d.setdefault("decks", [])
i = next((k for k, x in enumerate(ds) if x["id"] == deck["id"]), None)
if i is None: ds.append(deck)
else: ds[i] = deck
for lid in filter(None, a.link.split(",")):
    L = next((x for x in d["lessons"] if x["id"] == lid), None)
    if L is None: sys.exit(f"không có bài {lid}")
    L["deck"] = deck["id"]
json.dump(d, open(a.lessons, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
nw = sum(len(c["items"]) for c in cards); ng = sum(1 for c in cards if len(c["items"]) > 1)
print(f'{deck["id"]}: {len(cards)} thẻ ({ng} nhóm đồng nghĩa, chơi game được) · {nw} từ ·',
      dict(Counter(i["type"] for c in cards for i in c["items"])))
