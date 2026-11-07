#!/usr/bin/env python3
"""Build a SpeakBack flashcard deck from a pipe-separated card list and merge it into data/lessons.json.

Card file format (UTF-8):
  #id=dt3  #title=…  #session=3  #topic=…   (header lines)
  @Group name                                (starts a group; cards below belong to it)
  w|type|ipa|stress|band|mean|grammar|ex     (type: Vocab · Phrasal verb · Collocation · Idiom)
Band 8.5–9 → warn: true.

Usage: make_deck.py <cards.txt> <lessons.json> --for duc,thu [--opens YYYY-MM-DD] [--link lessonId,…]
"""
import argparse, json, sys
TYPES = {"Vocab", "Phrasal verb", "Collocation", "Idiom"}
BANDS = {"3–3.5", "4–5", "5.5–6.5", "7–8", "8.5–9"}

def parse(path):
    meta, cards, group = {}, [], ""
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        line = line.rstrip("\n")
        if not line.strip(): continue
        if line.startswith("#"):
            k, _, v = line[1:].partition("="); meta[k.strip()] = v.strip(); continue
        if line.startswith("@"): group = line[1:].strip(); continue
        f = line.split("|")
        if len(f) != 8: sys.exit(f"{path}:{n}: cần 8 cột, có {len(f)}")
        w, t, ipa, st, band, mean, gr, ex = [x.strip() for x in f]
        if t not in TYPES: sys.exit(f"{path}:{n}: type lạ {t!r}")
        if band not in BANDS: sys.exit(f"{path}:{n}: band lạ {band!r}")
        c = {"w": w, "type": t, "ipa": ipa, "stress": st, "band": band, "mean": mean, "grammar": gr, "ex": ex, "group": group}
        if band == "8.5–9": c["warn"] = True
        cards.append(c)
    seen = set()
    for c in cards:
        k = c["w"].lower()
        if k in seen: sys.exit(f"trùng thẻ: {c['w']}")
        seen.add(k)
    means = [c["mean"] for c in cards]
    dup = {m for m in means if means.count(m) > 1}
    if dup: print("⚠ nghĩa trùng (lựa chọn đoán nghĩa sẽ khó phân biệt):", dup)
    return meta, cards

ap = argparse.ArgumentParser()
ap.add_argument("cards"); ap.add_argument("lessons")
ap.add_argument("--for", dest="who", required=True)
ap.add_argument("--opens"); ap.add_argument("--link", default="")
a = ap.parse_args()
meta, cards = parse(a.cards)
deck = {"id": meta["id"], "title": meta["title"], "session": int(meta["session"]), "for": a.who.split(",")}
if meta.get("topic"): deck["topic"] = meta["topic"]
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
from collections import Counter
print(deck["id"], len(cards), "thẻ", dict(Counter(c["type"] for c in cards)), dict(Counter(c["band"] for c in cards)))
