#!/usr/bin/env python3
"""Shadowing video (copy of project claude/make_shadow_video.py)."""
import json, os, re, subprocess, sys, tempfile
import numpy as np
import sherpa_onnx
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont

ref, out, sid, mdir, title = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
VOICES = {k.strip(): int(v) for k, v in (p.split("=") for p in sys.argv[6].split(","))} if len(sys.argv) > 6 else {}
SPEED_REPEAT, SPEED_SHADOW = 0.85, 0.95
W = H = 1080
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
HL_FILL = {"y": (255, 236, 120), "g": (150, 240, 170), "b": (130, 220, 240)}
INK, GREY, FAINT, ACCENT = (20, 30, 45), (160, 170, 182), (195, 202, 210), (31, 78, 121)

tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(
    model=sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=f"{mdir}/model.onnx", voices=f"{mdir}/voices.bin", tokens=f"{mdir}/tokens.txt",
            data_dir=f"{mdir}/espeak-ng-data", lexicon=f"{mdir}/lexicon-us-en.txt", lang="en-us"),
        num_threads=4)))
SR = 24000


def speech_text(t):
    t = re.sub(r"\*\*|==|\+\+|!!", "", t)
    t = re.sub(r"(?<=[A-Za-z])'(?=(m|s|t|re|ll|ve|d)\b)", "\u0000", t)
    t = t.replace("'", "").replace("\u0000", "'").replace("‿", " ")
    t = re.sub(r"\b\w*[a-z][A-Z]\w*\b", lambda m: m.group(0).lower(), t)
    t = re.sub(r"\b([A-Z])(?:-(?=[A-Z]\b))", r"\1, ", t)
    t = re.sub(r"(?<=[A-Za-z])-(?=[A-Za-z])", " ", t)
    t = t.replace("...", ",")
    return re.sub(r"\s+", " ", t).strip()


def display_words(chunk):
    words, hl = [], None
    for part in re.split(r"(==|\+\+|!!|\*\*)", chunk):
        if part in ("==", "++", "!!"):
            key = {"==": "y", "++": "g", "!!": "b"}[part]
            hl = None if hl == key else key
        elif part and part != "**":
            for w in part.split():
                if re.fullmatch(r"[.,!?;:]+", w) and words:
                    words[-1] = (words[-1][0] + w, words[-1][1])
                else:
                    words.append((w, hl))
    return words


sentences = []
for line in open(ref, encoding="utf-8"):
    line = line.strip().lstrip(">").strip()
    if not line:
        continue
    label = None
    m = re.match(r"^\[([^\]]+)\]\s*", line)
    if m:
        label, line = m.group(1), line[m.end():]
    speaker = None
    m = re.match(r"^([A-Z][A-Za-z]+):\s*", line)
    if m:
        speaker, line = m.group(1), line[m.end():]
    for s in line.split("//"):
        chunks = [c.strip() for c in s.split("/") if speech_text(c)]
        if chunks:
            sentences.append({"chunks": chunks, "speaker": speaker, "label": label})

lex = {l.split(" ", 1)[0].lower() for l in open(f"{mdir}/lexicon-us-en.txt", encoding="utf-8")}
missing = sorted({w.lower().strip(".,!?;:") for s in sentences for c in s["chunks"] for w in speech_text(c).split()} - lex - {""})
if missing:
    sys.exit(f"Missing from lexicon: {missing}")


def say(text, speed, speaker=None):
    global SR
    a = tts.generate(text, sid=VOICES.get(speaker, sid), speed=speed)
    SR = a.sample_rate
    return np.array(a.samples, dtype=np.float32)


audio, timeline = [], []


def add(samples, state):
    audio.append(samples)
    timeline.append((len(samples) / SR, state))


def gap(sec, state):
    add(np.zeros(int(SR * sec), dtype=np.float32), state)


card = lambda label: {"card": label}
add(say("Part one. Listen and repeat.", 0.9), card(("Part 1", "Listen and repeat", "Nghe từng cụm, rồi nói lại")))
gap(1.0, card(("Part 1", "Listen and repeat", "Nghe từng cụm, rồi nói lại")))
for si, sent in enumerate(sentences):
    for ci, c in enumerate(sent["chunks"]):
        a = say(speech_text(c), SPEED_REPEAT, sent["speaker"])
        add(a, {"part": "Part 1 · Listen and repeat", "s": si, "c": ci, "turn": False})
        gap(len(a) / SR + 0.6, {"part": "Part 1 · Listen and repeat", "s": si, "c": ci, "turn": True})
    gap(0.4, {"part": "Part 1 · Listen and repeat", "s": si, "c": None, "turn": False})

for n in (1, 2):
    lab = ("Part 2", f"Shadowing · round {n}", "Nói cùng lúc với giọng đọc")
    gap(1.0, card(lab))
    add(say(f"Part two. Shadowing, round {['one', 'two'][n - 1]}.", 0.9), card(lab))
    gap(1.0, card(lab))
    for si, sent in enumerate(sentences):
        for ci, c in enumerate(sent["chunks"]):
            st = {"part": f"Part 2 · Shadowing · round {n}", "s": si, "c": ci, "turn": False}
            add(say(speech_text(c), SPEED_SHADOW, sent["speaker"]), st)
            gap(0.2 if ci < len(sent["chunks"]) - 1 else 0.6, st)
gap(1.5, card(("", "Good job!", "Ghi âm lại và gửi chị nha")))

wav = np.concatenate(audio)
wav = wav / max(1e-6, np.abs(wav).max()) * 0.9
total = len(wav) / SR

f_title = ImageFont.truetype(FONT_B, 30)
f_part = ImageFont.truetype(FONT_B, 34)
f_main = ImageFont.truetype(FONT, 58)
f_main_b = ImageFont.truetype(FONT_B, 58)
f_next = ImageFont.truetype(FONT, 32)
f_card1 = ImageFont.truetype(FONT_B, 64)
f_card2 = ImageFont.truetype(FONT, 40)
f_small = ImageFont.truetype(FONT, 26)
f_who = ImageFont.truetype(FONT_B, 38)


def layout(items, font_for, max_w, line_h):
    pos, x, y = [], 0, 0
    space = font_for(None).getlength(" ")
    for text, meta in items:
        w = font_for(meta).getlength(text)
        if x > 0 and x + w > max_w:
            x, y = 0, y + line_h
        pos.append((x, y, text, meta, w))
        x += w + space
    return pos, y + line_h


def sentence_items(si):
    items, ch = [], sentences[si]["chunks"]
    for ci, c in enumerate(ch):
        for w, hl in display_words(c):
            items.append((w, {"c": ci, "hl": hl}))
        items.append(("/" if ci < len(ch) - 1 else "//", {"c": ci, "hl": None, "sep": True}))
    return items


def base(part_label, t0):
    img = Image.new("RGB", (W, H), (250, 251, 253))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 96], fill=ACCENT)
    d.text((48, 30), title, font=f_title, fill=(255, 255, 255))
    if part_label:
        d.text((48, 130), part_label, font=f_part, fill=ACCENT)
    lx, ly = 48, H - 120
    for key, label in (("y", "từ vựng hay"), ("g", "phrasal verb / collocation"), ("b", "idiom")):
        d.rounded_rectangle([lx, ly + 4, lx + 26, ly + 30], 5, fill=HL_FILL[key])
        d.text((lx + 34, ly + 2), label, font=f_small, fill=(90, 100, 112))
        lx += 34 + f_small.getlength(label) + 30
    d.text((48, H - 78), "/ ngừng ngắn   // ngừng dài   ' nhấn âm   ‿ nối âm", font=f_small, fill=(90, 100, 112))
    d.rectangle([0, H - 14, W, H], fill=(225, 230, 236))
    d.rectangle([0, H - 14, int(W * t0 / total), H], fill=(242, 183, 5))
    return img, d


def render(state, t0, path):
    if "card" in state:
        p, l1, l2 = state["card"]
        img, d = base("", t0)
        for txt, f, y, col in ((p, f_part, 380, ACCENT), (l1, f_card1, 440, INK), (l2, f_card2, 540, (90, 100, 112))):
            if txt:
                d.text(((W - f.getlength(txt)) / 2, y), txt, font=f, fill=col)
        img.save(path)
        return
    img, d = base(state["part"], t0)
    si, cur = state["s"], state["c"]
    S = sentences[si]
    y0 = 230
    tag = " · ".join(x for x in (S["speaker"], S["label"]) if x)
    if tag:
        d.text((60, 190), tag, font=f_who, fill=(200, 120, 40))
        y0 = 250
    font_for = lambda m: f_main_b if (m and m.get("c") == cur) else f_main
    pos, h = layout(sentence_items(si), font_for, W - 120, 92)
    for x, y, text, m, w in pos:
        active = m["c"] == cur
        if m["hl"]:
            fill = HL_FILL[m["hl"]] if active or cur is None else tuple(int(v * 0.35 + 255 * 0.65) for v in HL_FILL[m["hl"]])
            d.rounded_rectangle([60 + x - 4, y0 + y - 2, 60 + x + w + 4, y0 + y + 70], 8, fill=fill)
        col = (200, 120, 40) if m.get("sep") else (INK if (active or cur is None) else GREY)
        d.text((60 + x, y0 + y), text, font=font_for(m), fill=col)
        if active and not m.get("sep"):
            d.rectangle([60 + x, y0 + y + 74, 60 + x + w, y0 + y + 79], fill=ACCENT)
    yb = y0 + h + 30
    if state["turn"]:
        msg = "Đến lượt em nói  ▶"
        tw = f_card2.getlength(msg)
        d.rounded_rectangle([(W - tw) / 2 - 30, yb, (W + tw) / 2 + 30, yb + 72], 36, fill=(242, 183, 5))
        d.text(((W - tw) / 2, yb + 12), msg, font=f_card2, fill=INK)
    if si + 1 < len(sentences):
        N = sentences[si + 1]
        nxt = (N["speaker"] + ": " if N["speaker"] else "") + " ".join(w for c in N["chunks"] for w, _ in display_words(c))
        npos, _ = layout([(w, None) for w in ("Tiếp theo:  " + nxt).split()], lambda m: f_next, W - 120, 46)
        ny = H - 300
        for x, y, text, m, w in npos[:40]:
            if y < 100:
                d.text((60 + x, ny + y), text, font=f_next, fill=FAINT)
    img.save(path)


with tempfile.TemporaryDirectory() as tmp:
    wav_path = os.path.join(tmp, "a.wav")
    sf.write(wav_path, wav, SR)
    lines, t0, cache = [], 0.0, {}
    for i, (dur, st) in enumerate(timeline):
        key = repr(st)
        if key not in cache or "card" not in st:
            path = os.path.join(tmp, f"f{i:04d}.png")
            render(st, t0, path)
            cache[key] = path
        lines.append(f"file '{cache[key]}'\nduration {dur:.4f}")
        t0 += dur
    lines.append(f"file '{cache[repr(timeline[-1][1])]}'")
    lst = os.path.join(tmp, "list.txt")
    open(lst, "w").write("\n".join(lines) + "\n")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-i", wav_path,
                    "-vf", "fps=25,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                    "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", out], check=True)
t, spans = 0.0, {}
for dur, st in timeline:
    if "card" not in st and st.get("c") is not None:
        key = ("r1" if st["part"].endswith("round 1") else "p1" if st["part"].startswith("Part 1") else None)
        if key:
            d = spans.setdefault(st["s"], {"r1": [None, None], "p1": []})
            if key == "r1":
                d["r1"][0] = t if d["r1"][0] is None else d["r1"][0]
                d["r1"][1] = t + dur
            elif not st["turn"]:
                d["p1"].append([round(t, 2), round(t + dur, 2)])
    t += dur
rows = []
for i, S in enumerate(sentences):
    row = {"text": " / ".join(S["chunks"]) + " //", "start": round(spans[i]["r1"][0], 2),
           "end": round(spans[i]["r1"][1], 2), "chunks": spans[i]["p1"]}
    if S["speaker"]:
        row["speaker"] = S["speaker"]
    if S["label"]:
        row["label"] = S["label"]
    rows.append(row)
json.dump(rows, open(os.path.splitext(out)[0] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(out, round(total, 1), "s")
