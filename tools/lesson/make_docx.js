const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  HeadingLevel, AlignmentType, LevelFormat, LineRuleType, ImageRun, BorderStyle, Footer, PageNumber, ExternalHyperlink,
  Bookmark, InternalHyperlink,
} = require('docx');

const FONT = 'Arial';
const NAVY = '1F3A68';
const PAGE_W = 11906, MARGIN = 850;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const DIR = process.argv[2] || '.';
const PIC = process.argv[4] || require('path').join(DIR, 'picture.png');

function runs(text, base = {}) {
  const out = [];
  const re = /(<mark(?: class="(?:ans|trap)")?>[^<]+<\/mark>|\[[^\]]+\]\(https?:[^)\s]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ font: FONT, ...base, text: text.slice(last, m.index) }));
    const t = m[0];
    if (t.startsWith('<mark')) {
      const fill = /class="ans"/.test(t) ? 'B9F6CA' : /class="trap"/.test(t) ? 'FFCDD2' : 'FFF176';
      out.push(new TextRun({ font: FONT, ...base, text: t.replace(/<[^>]+>/g, ''), shading: { type: ShadingType.CLEAR, fill, color: 'auto' } }));
    }
    else if (t.startsWith('[') && /\]\(http/.test(t)) {
      const lm = t.match(/^\[([^\]]+)\]\((https?:[^)\s]+)\)$/);
      out.push(new ExternalHyperlink({ link: lm[2], children: [new TextRun({ font: FONT, ...base, text: lm[1].replace(/\*\*/g, ''), bold: /\*\*/.test(lm[1]) || base.bold, color: '1155CC', underline: {} })] }));
    }
    else if (t.startsWith('**')) out.push(new TextRun({ font: FONT, ...base, text: t.slice(2, -2), bold: true }));
    else if (t.startsWith('`')) out.push(new TextRun({ ...base, text: t.slice(1, -1), font: 'Consolas' }));
    else out.push(new TextRun({ font: FONT, ...base, text: t.slice(1, -1), italics: true }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ font: FONT, ...base, text: text.slice(last) }));
  return out;
}

const border = { style: BorderStyle.SINGLE, size: 4, color: 'B9C3D4' };
const borders = { top: border, bottom: border, left: border, right: border };

function colWidths(header) {
  const n = header.length;
  const h = header.join('|');
  let pct;
  if (h.startsWith('#|Từ / cụm|Loại|Phát âm')) pct = [5, 16, 11, 17, 15, 12, 24];
  else if (h.startsWith('#|Phrasal verb') || h.startsWith('#|Collocation')) pct = [5, 15, 20, 9, 13, 19, 19];
  else if (h.startsWith('Câu|Ai')) pct = [6, 5, 16, 27, 22, 24];
  else if (h.startsWith('Câu|Nói về gì')) pct = [6, 18, 30, 20, 26];
  else if (h.startsWith('Câu|Đáp án')) pct = [8, 24, 68];
  else if (h.startsWith('Ngày|Bài')) pct = [28, 46, 26];
  else if (h.startsWith('#|Động từ')) pct = [8, 30, 20, 42];
  else if (h.startsWith('Thẻ|Từ cần đoán')) pct = [8, 24, 26, 42];
  else if (h.startsWith('Loại · từ gốc')) pct = [26, 30, 44];
  else if (h.startsWith('Bậc|Thêm gì')) pct = [8, 24, 34, 34];
  else if (h.startsWith('#|Câu hỏi|A|R|E|F')) pct = [6, 52, 7, 7, 7, 7, 14];
  else if (h.startsWith('#|Câu hỏi|A|R|E')) pct = [6, 58, 8, 8, 8, 12];
  else if (h.startsWith('Ngày|Đức|Thư')) pct = [24, 36, 40];
  else if (h.startsWith('#|Form|')) pct = [6, 40, 20, 17, 17];
  else if (h.startsWith('#|Notes|') || h.startsWith('#|Recipe card|') || h.startsWith('#|Câu hỏi|✍')) pct = [6, 46, 24, 24];
  else if (h === 'Bước|Làm như sau') pct = [24, 76];
  else if (h.startsWith('#|✍ Từ em nhớ ra') && n === 8) pct = [5, 22, 17, 6, 5, 22, 17, 6];
  else if (h.startsWith('Bước|Mục đích')) pct = [16, 24, 60];
  else if (h.startsWith('Từ gốc') && n === 2) pct = [32, 68];
  else if (h.startsWith('Từ gốc')) pct = [16, 24, 16, 24, 20];
  else pct = Array(n).fill(100 / n);
  const w = pct.map(p => Math.floor(CONTENT_W * p / 100));
  w[w.length - 1] += CONTENT_W - w.reduce((a, b) => a + b, 0);
  return w;
}

function makeTable(rows) {
  const header = rows[0];
  const widths = colWidths(header);
  const size = header.length >= 5 ? 16 : 18;
  const trs = rows.map((cells, ri) => {
    const first = cells[0].trim();
    const spanRow = ri > 0 && cells.length > 1 && cells.slice(1).every(c => c.trim() === '') && (first.startsWith('**') || first.startsWith('✍'));
    if (spanRow) {
      const isGroup = first.startsWith('**');
      return new TableRow({
        cantSplit: true,
        height: isGroup ? undefined : { value: (header[0] === 'Từ gốc' && header.length === 2) ? 1100 : 740, rule: 'atLeast' },
        children: [new TableCell({
          borders, columnSpan: cells.length,
          width: { size: CONTENT_W, type: WidthType.DXA },
          shading: isGroup ? { fill: 'F3F6FB', type: ShadingType.CLEAR, color: 'auto' } : undefined,
          margins: { top: 60, bottom: 60, left: 90, right: 90 },
          children: [new Paragraph({ keepNext: rows.length <= 16, spacing: { after: 0 }, children: runs(first, isGroup ? { size, color: NAVY } : { size, color: '555555' }) })],
        })],
      });
    }
    const tall = ri > 0 && ((header[0] === 'Từ gốc' && header.length === 2) || header[0].startsWith('Loại · từ gốc'));
    const mid = ri > 0 && (header.join('|').startsWith('#|Câu hỏi|A|R|E') || header[0] === 'Bậc');
    return new TableRow({
      tableHeader: ri === 0,
      height: tall ? { value: 900, rule: 'atLeast' } : mid ? { value: 560, rule: 'atLeast' } : undefined,
      cantSplit: true,
      children: cells.map((c, ci) => new TableCell({
        borders,
        width: { size: widths[ci], type: WidthType.DXA },
        shading: ri === 0 ? { fill: 'E8EEF8', type: ShadingType.CLEAR, color: 'auto' } : undefined,
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        children: [new Paragraph({ keepNext: rows.length <= 16 && ri < rows.length - 1, spacing: { after: 0, line: 260, lineRule: LineRuleType.AUTO }, children: runs(c.trim(), ri === 0 ? { size, bold: true, color: NAVY } : { size }) })],
      })),
    });
  });
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows: trs });
}

function bingo() {
  const w = Math.floor(CONTENT_W / 3);
  const thick = { style: BorderStyle.SINGLE, size: 12, color: NAVY };
  const b = { top: thick, bottom: thick, left: thick, right: thick };
  const rows = [0, 1, 2].map(() => new TableRow({
    height: { value: 1900, rule: 'exact' }, cantSplit: true,
    children: [0, 1, 2].map(() => new TableCell({ borders: b, width: { size: w, type: WidthType.DXA }, children: [new Paragraph({ keepNext: true, children: [] })] })),
  }));
  return [
    new Paragraph({ keepNext: true, keepLines: true, alignment: AlignmentType.CENTER, spacing: { before: 240, after: 80 }, children: [new TextRun({ text: 'Thẻ bingo', bold: true, size: 30, color: NAVY, font: FONT })] }),
    new Paragraph({ keepNext: true, alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: runs('**Luật:** **chọn 9 từ** điền vào thẻ → **nghe** nghĩa hoặc câu có chỗ trống → **gạch** từ đúng → đủ 1 hàng ngang, dọc hoặc chéo → **hô "Bingo!"**', { size: 20 }) }),
    new Table({ width: { size: w * 3, type: WidthType.DXA }, columnWidths: [w, w, w], rows }),
    new Paragraph({ spacing: { after: 160 }, children: [] }),
  ];
}

let HID = 0, TOC = [], TOC_DONE = false; const TOC_MARK = {};
function convert(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    let l = lines[i].replace(/\s*\{#[a-z0-9]+\}\s*$/, '');
    if (l.trim() === '') { i++; continue; }
    if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(s => s.trim());
        if (!/^-+$/.test(cells[0].replace(/\s/g, ''))) rows.push(cells);
        i++;
      }
      out.push(makeTable(rows));
      out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      continue;
    }
    if (l.startsWith('# ')) {
      const id = 'h' + (++HID);
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new Bookmark({ id, children: runs(l.slice(2)) })] }));
      TOC.push({ lvl: 1, id, text: l.slice(2) });
      if (!TOC_DONE) { TOC_DONE = true; out.push(TOC_MARK); }
    } else if (l.startsWith('### ')) {
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(l.slice(4)) }));
    } else if (l.startsWith('## ')) {
      const id = 'h' + (++HID);
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: /\{#(listen|vocab|vgames|ladder|alt)\}/.test(lines[i]), children: [new Bookmark({ id, children: runs(l.slice(3)) })] }));
      TOC.push({ lvl: 2, id, text: l.slice(3) });
    } else if (l.startsWith('    - ')) {
      out.push(new Paragraph({ numbering: { reference: 'bul', level: 1 }, children: runs(l.slice(6)) }));
    } else if (l.startsWith('- ')) {
      // keep a bullet that introduces a table on the same page as the table
      let j = i + 1; while (j < lines.length && !lines[j].trim()) j++;
      out.push(new Paragraph({ numbering: { reference: 'bul', level: 0 }, keepNext: j < lines.length && lines[j].startsWith('|'), children: runs(l.slice(2)) }));
    } else if (l === '[[BINGO]]') {
      out.push(...bingo());
    } else if (l === '[[PICTURE]]') {
      out.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: fs.readFileSync(PIC), transformation: { width: 640, height: 427 } })] }));
    } else if (l.startsWith('<div class="script"')) {
      i++;
      const body = [];
      while (i < lines.length && !lines[i].startsWith('</div>')) { if (lines[i].trim()) body.push(lines[i]); i++; }
      body.forEach((t, k) => out.push(new Paragraph({
        shading: { fill: 'F7F7F2', type: ShadingType.CLEAR, color: 'auto' },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: NAVY, space: 8 } },
        spacing: { before: k === 0 ? 80 : 0, after: k === body.length - 1 ? 120 : 0, line: 360 },
        indent: { left: 200 },
        children: runs(t, { size: 21 }),
      })));
    } else if (l.startsWith('<p class="slogan">')) {
      const t = l.replace(/<[^>]+>/g, '').toUpperCase();
      out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300 }, children: [new TextRun({ text: t, bold: true, size: 26, color: NAVY, font: FONT })] }));
    } else {
      out.push(new Paragraph({ children: runs(l) }));
    }
    i++;
  }
  return out;
}

const student = convert(fs.readFileSync(require('path').join(DIR, 'student.md'), 'utf8'));
const alts = convert(fs.readFileSync(require('path').join(DIR, 'alternatives.md'), 'utf8'));
function tocBlock() {
  const out = [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Mục lục', bold: true, size: 24, color: NAVY, font: FONT })] })];
  TOC.forEach(e => out.push(new Paragraph({ indent: { left: e.lvl === 1 ? 0 : 360 }, spacing: { after: 20 },
    children: [new InternalHyperlink({ anchor: e.id, children: [new TextRun({ text: e.text.replace(/\*\*/g, ''), font: FONT, size: e.lvl === 1 ? 20 : 19, bold: e.lvl === 1, color: '1155CC', underline: {} })] })] })));
  out.push(new Paragraph({ spacing: { before: 60, after: 200 }, children: [new TextRun({ text: 'Gập / mở: rê chuột vào tiêu đề → bấm ◢ · View → Navigation Pane để xem cây mục lục', italics: true, size: 17, color: '666666', font: FONT })] }));
  return out;
}
const fill = arr => arr.flatMap(x => x === TOC_MARK ? tocBlock() : [x]);
const pageProps = { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, bottom: 850, left: MARGIN, right: MARGIN } } };
const footer = { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888', font: FONT })] })] }) };

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 20 }, paragraph: { spacing: { after: 80, line: 300, lineRule: LineRuleType.AUTO } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 34, bold: true, color: NAVY, font: FONT },
        paragraph: { spacing: { before: 120, after: 160 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, color: NAVY, font: FONT },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1, keepNext: true } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, color: '2F5597', font: FONT },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: { config: [{ reference: 'bul', levels: [
    { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } },
    { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 240 } } } },
  ] }] },
  sections: [
    { properties: pageProps, footers: footer, children: fill(student) },
    { properties: pageProps, footers: footer, children: alts },
  ],
});

const OUT = require('path').join(DIR, `Session ${process.argv[3] || 'N'}_Speaking_Student.docx`);
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('ok', OUT); });
