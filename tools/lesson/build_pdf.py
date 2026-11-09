import re, io, markdown, pypdf
from weasyprint import HTML
from pypdf.generic import DictionaryObject, NameObject, ArrayObject, NumberObject, RectangleObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

import sys, os
D = os.path.abspath(sys.argv[1]) + "/"; N = int(sys.argv[2]); PIC = sys.argv[3] if len(sys.argv) > 3 else D + "picture.png"
md = markdown.Markdown(extensions=["tables", "attr_list", "md_in_html"])
def conv(path):
    t = open(path).read().replace("- [ ] ", "- ☐ ")
    md.reset(); return md.convert(t)

bingo = '<div class="bingowrap" id="bingocard"><h2 class="bingotitle">Thẻ bingo</h2><p class="brules"><b>Luật:</b> <b>chọn 9 từ</b> điền vào thẻ → <b>nghe</b> nghĩa hoặc câu có chỗ trống → <b>gạch</b> từ đúng → đủ 1 hàng ngang, dọc hoặc chéo → <b>hô "Bingo!"</b></p><table class="bingo">' + \
        "".join("<tr>" + "<td></td>" * 3 + "</tr>" for _ in range(3)) + '</table></div>'
pic = f'<img class="pic" src="file://{PIC}">'
teacher = conv(D + "teacher.md"); alts = conv(D + "alternatives.md")
student = conv(D + "student.md").replace("<p>[[BINGO]]</p>", bingo).replace("<p>[[PICTURE]]</p>", pic)

css = """
@page { size: A4; margin: 11mm 11mm 15mm 11mm;
  @bottom-right { content: counter(page) "/" counter(pages); font: 7pt 'DejaVu Sans'; color:#888; } }
body { font-family: 'DejaVu Sans', sans-serif; font-size: 9.6pt; line-height: 1.5; color:#1d2433; }
h1 { bookmark-state: closed; } h2 { bookmark-level: 2; bookmark-state: closed; } h3 { bookmark-level: 3; } h4, h5, h6 { bookmark-level: none; }
h1 { font-size: 18pt; color:#1f3a68; margin: 0 0 8px; border-bottom: 2px solid #1f3a68; padding-bottom:3px; }
h1#student, h1#answerkey { page-break-before: always; }
h2 { font-size: 13pt; color:#1f3a68; margin: 16px 0 6px; }
h3 { font-size: 11pt; color:#2f5597; margin: 12px 0 5px; }
ul { margin: 4px 0 8px 0; padding-left: 16px; } li { margin: 3px 0; } ul ul { margin:0; }
p { margin: 5px 0; }
table { border-collapse: collapse; width: 100%; margin: 6px 0 10px; page-break-inside: auto; }
tr { page-break-inside: avoid; }
th { background:#e8eef8; color:#1f3a68; text-align:left; font-weight:bold; }
th, td { border: 0.5px solid #b9c3d4; padding: 4px 6px; vertical-align: top; }
.toc { background:#f2f5fb; border:1px solid #c9d4ea; border-radius:5px; padding:4px 8px; margin-bottom:6px; }
.toc p { margin:0 0 2px; } .toc a, a { color:#1f5fbf; text-decoration:none; }
a[href^="http"] { text-decoration: underline; }
.slogan { text-align:center; font-weight:bold; color:#1f3a68; font-size:12pt; margin:8px 0; text-transform: uppercase; }
.bingowrap { page-break-inside: avoid; margin-top: 10px; }
.bingotitle { text-align:center; font-size:15pt; margin:4px 0; }
table.bingo { width: 100%; margin-top: 3mm; border-collapse: separate; border-spacing: 0; }
.brules { font-size: 10pt; text-align:center; }
table.bingo td { height: 36mm; border: 1.5px solid #1f3a68; width:33%; }
img.pic { width: 100%; border: 1px solid #c9d4ea; }
.script p { white-space: pre-line; font-size: 10.5pt; line-height: 1.8; background:#f7f7f2; padding:5px 8px; border-left:3px solid #1f3a68; }
table.vocab { font-size: 9pt; width: 100%; }
table.vocab th:nth-child(1) { width: 4%; } table.vocab th:nth-child(2) { width: 16%; } table.vocab th:nth-child(3) { width: 10%; }
table.vocab th:nth-child(4) { width: 17%; } table.vocab th:nth-child(5) { width: 15%; } table.vocab th:nth-child(6) { width: 12%; } table.vocab th:nth-child(7) { width: 26%; }
table.pvco { font-size: 8.6pt; }
table.pvco th:nth-child(1){width:4%} table.pvco th:nth-child(2){width:15%} table.pvco th:nth-child(3){width:20%} table.pvco th:nth-child(4){width:9%}
table.pvco th:nth-child(5){width:13%} table.pvco th:nth-child(6){width:19%} table.pvco th:nth-child(7){width:20%}
table.altall { font-size: 8.8pt; }
tr.grp td { background:#f3f6fb; font-weight:bold; color:#1f3a68; }
h2#vgames, h2#ladder, h2#alt { page-break-before: always; } table.taboo td { border: 1px dashed #7a8aa6; } table.taboo, table.match, table.ladder, table.hot, table.alt3 { page-break-inside: avoid; } table.alt3 td { height: 12mm; } table.hot td { height: 6.5mm; padding: 2px 6px; } table.hot td:nth-child(n+3) { width: 7%; } table.alt1 { page-break-inside: avoid; width:100%; font-size:10.5pt; } table.alt1 th:first-child { width: 32%; } table.alt1 tbody tr:not(.write) td { height: 24mm; vertical-align: top; } table.alt1 th:last-child { font-size: 13pt; } table.alt1 tr.write td { height: 20mm; }
tr.write td { height: 13mm; color:#555; vertical-align: top; }
mark { background:#fff176; padding:0 1px; } mark.ans { background:#b9f6ca; } mark.trap { background:#ffcdd2; }
h4 { font-size: 10.2pt; color:#1f3a68; margin: 10px 0 4px; }
code { font-family: 'DejaVu Sans Mono'; font-size: 7.5pt; }
"""
nb = lambda h: re.sub(r"\[(\d[\d.]*–[\d.]+)\]", r"<span style='white-space:nowrap'>[\1]</span>", h)
teacher, student, alts = nb(teacher), nb(student), nb(alts)
def span_rows(h):
    def fix(m):
        row = m.group(0)
        tds = re.findall(r'<td[^>]*>(.*?)</td>', row, flags=re.S)
        if len(tds) > 1 and all(t.strip() == '' for t in tds[1:]) and (tds[0].strip().startswith('<strong>') or tds[0].strip().startswith('✍')):
            cls = 'grp' if tds[0].strip().startswith('<strong>') else 'write'
            return f'<tr class="{cls}"><td colspan="{len(tds)}">{tds[0]}</td></tr>'
        return row
    return re.sub(r'<tr>.*?</tr>', fix, h, flags=re.S)
student = span_rows(student)
student = student.replace('<table>\n<thead>\n<tr>\n<th>#</th>\n<th>Từ / cụm</th>', '<table class="vocab">\n<thead>\n<tr>\n<th>#</th>\n<th>Từ / cụm</th>', 1)
for hd,cl in [('<th>Thẻ</th>','taboo'),('<th>#</th>\n<th>Động từ</th>','match'),('<th>Loại · từ gốc','alt3'),('<th>Bậc</th>','ladder'),('<th>#</th>\n<th>Câu hỏi</th>','hot')]:
    student = student.replace('<table>\n<thead>\n<tr>\n'+hd, '<table class="'+cl+'">\n<thead>\n<tr>\n'+hd, 1)
alts = alts.replace('<table>\n<thead>\n<tr>\n<th>#</th>', '<table class="pvco">\n<thead>\n<tr>\n<th>#</th>')
alts = alts.replace('<table>\n<thead>\n<tr>\n<th>Từ gốc</th>', '<table class="altall">\n<thead>\n<tr>\n<th>Từ gốc</th>', 1)
html = f"<html><head><meta charset='utf-8'><style>{css}</style></head><body>{teacher}{student}{alts}</body></html>"
open(D+"preview.html","w").write(html)
doc = HTML(string=html, base_url=D).render()
print("pages:", len(doc.pages))
tree = doc.make_bookmark_tree(); pdf_bytes = doc.write_pdf()
starts = {}
def walk(nodes):
    for b in nodes:
        starts[b[0]] = b[1][0]; walk(b[2])
walk(tree)
def find(prefix):
    for k, v in starts.items():
        if k.startswith(prefix): return v
    return 0
nav = [("Mục lục", 0), ("Speaking 101", find("1. Speaking 101")), ("Lộ trình", find("2. Lộ trình")), ("Agenda", find("3. Agenda")),
       ("Listening", find("3.1 Listening")), ("Homework", find("4. Bài tập")), ("Student", find(f"Speaking Session {N} – Student")), ("Vocab", find("2. Vòng Vocab") or find("2. Vocab games")), ("Ladder", find("5. Part 1 Ladder")),
       ("Bài tập", find("7. Bài tập tuần")), ("Alternatives", find(f"Speaking Session {N} – Alternatives"))]
print(nav)
pdfmetrics.registerFont(TTFont("DV", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
r = pypdf.PdfReader(io.BytesIO(pdf_bytes)); w = pypdf.PdfWriter(clone_from=r)
W, H = [float(x) for x in w.pages[0].mediabox[2:]]
for i, page in enumerate(w.pages):
    b = io.BytesIO(); c = canvas.Canvas(b, pagesize=(W, H)); c.setFont("DV", 7)
    x = 31; rects = []
    for name, tgt in nav:
        tw = pdfmetrics.stringWidth(name, "DV", 7)
        c.setFillColorRGB(0.12, 0.37, 0.75); c.drawString(x, 18, name); rects.append((x - 2, 14, x + tw + 2, 27, tgt)); x += tw + 11
    c.save(); b.seek(0); page.merge_page(pypdf.PdfReader(b).pages[0])
    for (x0, y0, x1, y1, t) in rects:
        a = DictionaryObject({NameObject("/Type"): NameObject("/Annot"), NameObject("/Subtype"): NameObject("/Link"),
                              NameObject("/Rect"): RectangleObject((x0, y0, x1, y1)), NameObject("/Border"): ArrayObject([NumberObject(0)] * 3),
                              NameObject("/Dest"): ArrayObject([w.pages[t].indirect_reference, NameObject("/Fit")])})
        if "/Annots" not in page: page[NameObject("/Annots")] = ArrayObject()
        page["/Annots"].append(w._add_object(a))
w.page_mode = "/UseOutlines"
w.write(D + f"Session {N}_Speaking.pdf"); print("wrote", D + f"Session {N}_Speaking.pdf")
