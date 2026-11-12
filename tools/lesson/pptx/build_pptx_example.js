const pptxgen = require('pptxgenjs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const gi = require('react-icons/gi'), tb = require('react-icons/tb');
const fs = require('fs');
const { applyTheme } = require(process.env.SKILL + '/scripts/apply_theme.js');

const THEME = { name: 'Food Kitchen', headFontFace: 'Cambria', bodyFontFace: 'Calibri',
  colors: { dk1: '1E2A24', lt1: 'FFFFFF', dk2: '1F4E3D', lt2: 'EEF5F0', accent1: 'E4572E', accent2: '1F4E3D', accent3: 'F2A541',
    accent4: '3A86A8', accent5: '8E5BB5', accent6: '6A994E', hlink: '1F6FB2', folHlink: '7A4FA0' } };
const HEX = { green: '1F4E3D', tomato: 'E4572E', gold: 'F2A541', mint: 'EEF5F0', ink: '1E2A24', blue: '3A86A8', purple: '8E5BB5', leaf: '6A994E', grey: '5B6660' };

const V = JSON.parse(fs.readFileSync('vocab.json', 'utf8')).map(v => Object.assign(v, { st: v.st.replace(/‿/g, '_') }));
const ICON = { 1: 'GiHotMeal', 2: 'GiCarrot', 3: 'GiOpenBook', 4: 'GiMeal', 5: 'GiChipsBag', 6: 'TbPaperBag', 7: 'GiChiliPepper', 8: 'TbMoodHappy', 9: 'TbSalad', 10: 'TbHome', 11: 'TbLeaf', 12: 'TbScale',
  13: 'GiKitchenKnives', 14: 'GiWhisk', 15: 'GiBread', 16: 'GiDumpling', 17: 'TbEggFried', 18: 'GiNoodles', 19: 'TbSoup', 20: 'GiSpoon', 21: 'GiForkKnifeSpoon', 22: 'GiSoap',
  23: 'TbChefHat', 24: 'TbConfetti', 25: 'GiFoodTruck', 26: 'TbBuildingStore', 27: 'GiShoppingCart', 28: 'TbBowlChopsticks', 29: 'GiFruitBowl', 30: 'TbMenu2', 31: 'TbCalendarEvent', 32: 'GiPeanut', 33: 'GiCook', 34: 'TbReceipt',
  35: 'TbClock', 36: 'TbBox', 37: 'TbDesk', 38: 'GiSandwich', 39: 'TbAlarm', 40: 'TbTruckDelivery', 41: 'TbUsersGroup', 42: 'GiPresent', 43: 'TbPigMoney', 44: 'GiCookingPot' };

async function icon(name, color = '#FFFFFF', size = 256) {
  const C = (gi[name] || tb[name]);
  if (!C) throw new Error('no icon ' + name);
  const svg = RDS.renderToStaticMarkup(React.createElement(C, { color, size }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'Speaking Session 4 – Food & Cooking';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.333, H = 7.5;
  const speaker = await icon('TbVolume', '#FFFFFF', 256);

  pres.defineSlideMaster({ title: 'DARK', background: { color: HEX.green },
    objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 2.3, w: 7.6, h: 1.6, fontSize: 44, bold: true, color: C.background1, fontFace: 'Cambria', valign: 'top' }, text: '' } }] });
  pres.defineSlideMaster({ title: 'CONTENT', background: { color: 'FFFFFF' },
    objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.1, h: 0.8, fontSize: 34, bold: true, color: C.text2, fontFace: 'Cambria', valign: 'middle', margin: 0 }, text: '' } },
      { text: { text: 'Session 4 · Food & Cooking', options: { x: 0.6, y: 7.05, w: 6, h: 0.3, fontSize: 10, color: HEX.grey, margin: 0 } } }],
    slideNumber: { x: 12.3, y: 7.05, w: 0.5, h: 0.3, fontSize: 10, color: HEX.grey } });

  const T = (s, t) => s.addText(t, { placeholder: 'title' });
  const audio = (s, path, x, y, size = 0.42) => s.addMedia({ type: 'audio', path, x, y, w: size, h: size, cover: speaker });
  const circle = async (s, name, x, y, d, fill) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
    s.addImage({ data: await icon(name), x: x + d * 0.2, y: y + d * 0.2, w: d * 0.6, h: d * 0.6 });
  };
  const card = (s, x, y, w, h, fill = HEX.mint) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.12 });
  const text = (s, t, o) => s.addText(t, Object.assign({ isTextBox: true, fontSize: 16, color: HEX.ink, margin: 0, valign: 'top' }, o));
  const SLOGAN = 'YOU ARE HELPING ALL OF US BY MAKING MISTAKES HERE.';

  // 1. Title
  pres.addSection({ title: 'Mở đầu' });
  let s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Mở đầu' });
  T(s, 'Food & Cooking');
  text(s, 'Speaking & Listening · Session 4 · Thursday 12/11/2026', { x: 0.7, y: 1.5, w: 7.6, h: 0.5, fontSize: 18, color: 'FFFFFF' });
  text(s, 'Mindset for IELTS Foundation · Unit 5 · Part 1 + Listening form completion', { x: 0.7, y: 4.0, w: 6.8, h: 0.8, fontSize: 18, color: 'D7E8DD' });
  text(s, SLOGAN, { x: 0.7, y: 6.4, w: 7, h: 0.5, fontSize: 12, bold: true, color: HEX.gold });
  s.addImage({ path: 'picture.png', x: 8.0, y: 1.6, w: 4.9, h: 3.27, rounding: false });
  s.addNotes('Buổi 4 · 12/11/2026 · 15:30–17:00 · Foundation U5 Food · giai đoạn 1 Part 1 foundation.\nAnh – Mỹ: takeout = takeaway, cafeteria = canteen, check = bill, do the dishes = wash up, reservation = booking, favorite = favourite.\nBạn A ~4.0, nghe được ít: làm đủ A.R.E. + F. Bạn B nghe gần như chưa được: thêm khung câu, câu Hot seat ★, dừng audio sau từng câu.\nChuẩn bị: in Word HS mỗi bạn 1 bản, giấy nhỏ ghi từ Taboo, giấy ghi điểm cộng dồn, đồng hồ bấm giờ.');

  // 2. Agenda
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Mở đầu' });
  T(s, "Today's 90 minutes");
  const ag = [['15:30', '5', 'Warm-up', 'Quiz nhớ lại 8 từ', 'TbBulb'], ['15:35', '30', 'Listening', 'Form completion', 'TbHeadphones'], ['16:05', '15', 'Vòng Vocab', 'Brain dump · Teach-back · Taboo', 'TbBook'],
    ['16:20', '25', 'Part 1 Ladder', 'A.R.E. + F · Hot seat', 'TbMicrophone'], ['16:45', '10', 'Shadowing', 'My lunch box', 'TbRepeat'], ['16:55', '5', 'Wrap-up', 'Exit ticket · bài tập tuần', 'TbChecklist']];
  for (let i = 0; i < ag.length; i++) {
    const x = 0.6 + i * 2.05, y = 1.6;
    card(s, x, y, 1.85, 4.6, i % 2 ? HEX.mint : 'FDEEE9');
    await circle(s, ag[i][4], x + 0.5, y + 0.3, 0.85, i % 2 ? HEX.green : HEX.tomato);
    text(s, ag[i][0], { x: x + 0.15, y: y + 1.35, w: 1.55, h: 0.4, fontSize: 16, bold: true, color: HEX.grey, align: 'center' });
    text(s, ag[i][1] + "'", { x: x + 0.15, y: y + 1.8, w: 1.55, h: 0.8, fontSize: 40, bold: true, color: i % 2 ? HEX.green : HEX.tomato, align: 'center' });
    text(s, ag[i][2], { x: x + 0.15, y: y + 2.75, w: 1.55, h: 0.5, fontSize: 17, bold: true, align: 'center' });
    text(s, ag[i][3], { x: x + 0.15, y: y + 3.3, w: 1.55, h: 1.1, fontSize: 13, color: HEX.grey, align: 'center' });
  }
  s.addNotes('Mục tiêu: FC trả lời 10 câu Part 1, 20–30 giây, đủ A.R.E. + F (Bạn B: A + R + F với khung câu) · LR tự nhớ ra 12 từ nhóm A, dùng ≥4 từ chủ đề + 1 paraphrase (delicious → tasty) · GRA đếm được / không đếm được, quá khứ đơn · P đuôi -s /s/ /z/ /ɪz/, nhấn REC-i-pe, de-LI-cious · Listening: form completion, đánh vần, số, bẫy đổi ý.\nTính điểm cả buổi: mỗi lượt đúng +1, điểm Hot seat cộng tiếp, cuối buổi công bố người thắng.');

  // 3. Warm-up quiz
  pres.addSection({ title: 'Warm-up' });
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Warm-up' });
  T(s, 'Quick recall: say the word');
  const quiz = ['kỳ nghỉ (Anh: holiday)', 'điểm đến', 'chỗ ở', 'đặt trước', 'nhớ nhà', 'chuyến công tác', 'thư giãn, xả hơi (phrasal verb)', 'nạp lại năng lượng (idiom)'];
  for (let i = 0; i < 8; i++) {
    const x = 0.6 + (i % 4) * 3.05, y = 1.55 + Math.floor(i / 4) * 2.55;
    card(s, x, y, 2.85, 2.3, i < 6 ? HEX.mint : 'FDF3E1');
    text(s, String(i + 1), { x: x + 0.25, y: y + 0.2, w: 1, h: 0.6, fontSize: 30, bold: true, color: i < 6 ? HEX.green : HEX.gold });
    text(s, quiz[i], { x: x + 0.25, y: y + 0.95, w: 2.4, h: 1.1, fontSize: 17 });
  }
  text(s, '1–6: Session 3 (Travel) · 7–8: Session 1 (Free time) · đúng từ + đúng nhấn âm: +1', { x: 0.6, y: 6.55, w: 12, h: 0.35, fontSize: 13, color: HEX.grey });
  s.addNotes('5 phút. Giáo viên đọc nghĩa → HS nói từ, đúng nhấn âm +1.\nĐáp án: 1 vacation (va-CA-tion) · 2 destination (des-ti-NA-tion) · 3 accommodation (ac-com-mo-DA-tion) · 4 book in advance · 5 homesick · 6 business trip · 7 chill out · 8 recharge my batteries.\nSau quiz: chữa 2–3 lỗi chung trong bài tập tuần Travel trên SpeakBack → hỏi nhanh: What did you have for breakfast today?');

  // 4. Listening intro
  pres.addSection({ title: 'Listening' });
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Listening' });
  T(s, 'Listening Part 1: form completion');
  text(s, [{ text: 'A conversation between 2 people about a booking or a registration.', options: { breakLine: true } },
    { text: 'You fill in a form: ONE WORD AND/OR A NUMBER.', options: { bold: true, color: HEX.tomato } }], { x: 0.6, y: 1.4, w: 12, h: 0.9, fontSize: 18 });
  const types = [['name', 'đánh vần', 'TbAbc'], ['phone', 'số', 'TbPhone'], ['date', 'ngày', 'TbCalendarEvent'], ['time', 'giờ', 'TbClock'], ['number', 'số lượng', 'TbUsersGroup'], ['price', 'tiền', 'TbCash']];
  for (let i = 0; i < 6; i++) {
    const x = 0.6 + i * 2.05;
    card(s, x, 2.7, 1.85, 2.6);
    await circle(s, types[i][2], x + 0.5, 2.95, 0.85, i % 2 ? HEX.tomato : HEX.green);
    text(s, types[i][0], { x: x + 0.1, y: 4.0, w: 1.65, h: 0.5, fontSize: 20, bold: true, align: 'center' });
    text(s, types[i][1], { x: x + 0.1, y: 4.5, w: 1.65, h: 0.5, fontSize: 15, color: HEX.grey, align: 'center' });
  }
  text(s, 'Pre-listening: Have you ever taken a cooking class? · Do you prefer street food or a buffet? · Are you allergic to any food?', { x: 0.6, y: 5.7, w: 12, h: 0.8, fontSize: 16, italic: true, color: HEX.green });
  s.addNotes('Listening 30\' (15:35). Dạng bài Unit 5 = Form completion, IELTS Part 1. Audio Mindset chỉ dùng trên lớp, không đưa lên SpeakBack.\nBước 1 Pre-listening 3\': hỏi nhanh 3 câu ở cuối slide (từ nhóm C) → viết lên bảng 6 loại thông tin.\nAudio của buổi: track 09 làm mẫu (0:31) · track 10 luyện (2:46) · đề tự viết 0.75× (4:14) → tốc độ thật (3:23, ~140 từ/phút) · track 08 (1:54) nghe thêm nếu dư giờ.\nLink Drive: track 09 https://drive.google.com/file/d/16wbaOLTp1TZT5hCNGvQmH3Apjlpa4q5o/view · track 10 https://drive.google.com/file/d/1gkcU_brr9lO9xWteShhR5cp_TrSQTD5B/view · track 08 https://drive.google.com/file/d/1NLQmxKgTTEHr3FBsyfkB1oqhK_ScXtj6/view');

  // 5-6. Strategy
  const strat = [
    ['1', 'Read the word limit', 'ONE WORD AND/OR A NUMBER → không chép chữ đã in sẵn', [{ text: 'Bring: a (8) …… → ' }, { text: 'notebook', options: { bold: true } }]],
    ['2', 'Guess the type', 'name → chữ · phone → số · price → tiền · noun: số ít hay số nhiều?', [{ text: 'Allergy', options: { highlight: 'FFF176' } }, { text: ': (7) → danh từ, thường số nhiều' }]],
    ['3', 'Spot the paraphrase', 'Từ trên form thường được nói cách khác', [{ text: 'Number of people', options: { highlight: 'FFF176' } }, { text: ' ↔ ' }, { text: 'how many people', options: { highlight: 'B9F6CA' } }]],
    ['4', 'Linear thinking', 'Câu hỏi theo thứ tự audio; mắt bám từ khóa câu kế tiếp; lỡ thì bỏ, đi tiếp', [{ text: 'Chờ (4) time, nghe ' }, { text: 'how many people', options: { highlight: 'FFF176' } }, { text: ' → đã sang câu 5' }]],
    ['5', 'Spelling', 'A /eɪ/ · E /iː/ · I /aɪ/ · G /dʒiː/ · J /dʒeɪ/ · R /ɑːr/ · double = 2 chữ liền', [{ text: 'M – E – R – C – E – R', options: { highlight: 'B9F6CA' } }]],
    ['6', 'Numbers', 'oh = 0 · double five = 55 · thirTEEN ≠ THIRty', [{ text: 'oh nine oh three, double five two…', options: { highlight: 'B9F6CA' } }]],
    ['7', 'Change of mind', 'actually, no · but · I\'m afraid · used to · at first · now → lấy thông tin sau cùng', [{ text: 'It used to start at nine', options: { highlight: 'FFCDD2' } }, { text: '… Now … ' }, { text: 'nine thirty', options: { highlight: 'B9F6CA' } }]],
    ['8', 'Cross out negatives', 'nobody, we don\'t need, we\'ll skip → không phải đáp án', [{ text: 'Nobody is vegetarian', options: { highlight: 'FFCDD2' } }, { text: ' … But … ' }, { text: 'peanuts', options: { highlight: 'B9F6CA' } }]],
    ['9', 'Check', 'Chính tả · -s số nhiều · chữ số · viết hoa tên', [{ text: 'peanut ✗ → peanuts ✓' }]]];
  for (const [part, idx] of [[strat.slice(0, 5), 1], [strat.slice(5), 2]]) {
    s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Listening' });
    T(s, `Form completion: strategy (${idx}/2)`);
    text(s, [{ text: ' key word ', options: { highlight: 'FFF176' } }, { text: '   ' }, { text: ' answer ', options: { highlight: 'B9F6CA' } }, { text: '   ' }, { text: ' trap ', options: { highlight: 'FFCDD2' } }], { x: 9.0, y: 0.55, w: 3.7, h: 0.4, fontSize: 13, align: 'right' });
    part.forEach((r, i) => {
      const y = 1.35 + i * 1.08;
      card(s, 0.6, y, 12.1, 0.95, i % 2 ? 'FFFFFF' : HEX.mint);
      s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.17, w: 0.6, h: 0.6, fill: { color: idx === 1 ? HEX.green : HEX.tomato }, line: { color: idx === 1 ? HEX.green : HEX.tomato } });
      text(s, r[0], { x: 0.8, y: y + 0.17, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      text(s, r[1], { x: 1.6, y: y + 0.12, w: 3.2, h: 0.4, fontSize: 17, bold: true });
      text(s, r[2], { x: 1.6, y: y + 0.5, w: 5.2, h: 0.42, fontSize: 13, color: HEX.grey });
      text(s, r[3], { x: 7.0, y: y + 0.15, w: 5.5, h: 0.65, fontSize: 16, valign: 'middle' });
    });
    s.addNotes(idx === 1 ? 'Dạy chiến lược 6\': đi qua 9 bước; đọc bảng chữ cái dễ nhầm (A/E/I, G/J, R) và cách đọc số (oh, double). Cho HS đoán loại thông tin 8 ô của đề tự viết, viết bút chì cạnh ô (tên, số, ngày…).\nLinear thinking: câu hỏi đi theo thứ tự audio, tai nghe câu đang làm, mắt bám từ khóa câu sau.' : 'Bẫy đổi ý là bẫy phổ biến nhất của form completion: thông tin đầu bị sửa → lấy thông tin sau cùng.\nBạn B: cho Bạn B nhìn danh sách từ báo đổi ý (actually, but, used to, at first, now) khi nghe.');
  }

  // 7. Mindset audio
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Listening' });
  T(s, 'Mindset Unit 5: model + practice');
  const mind = [['Track 09 · Ex 14', 'Model', 'A chef introduces a dish. Before listening: guess the TYPE of answer (a dish name).', 'aud/t09.mp3', '0:31', HEX.green],
    ['Track 10 · Ex 15', 'Practice', 'How to make the dish: 8 cooking verbs, in order. Then: numbers & ingredients.', 'aud/t10.mp3', '2:46', HEX.tomato]];
  for (let i = 0; i < 2; i++) {
    const x = 0.6 + i * 6.2, m = mind[i];
    card(s, x, 1.45, 5.9, 4.9);
    text(s, m[1], { x: x + 0.4, y: 1.75, w: 3, h: 0.5, fontSize: 16, bold: true, color: m[5] });
    text(s, m[0], { x: x + 0.4, y: 2.25, w: 5, h: 0.6, fontSize: 26, bold: true });
    text(s, m[2], { x: x + 0.4, y: 3.05, w: 5.1, h: 1.4, fontSize: 17 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.4, y: 4.75, w: 1.0, h: 1.0, fill: { color: m[5] }, line: { color: m[5] } });
    audio(s, m[3], x + 0.6, 4.95, 0.6);
    text(s, m[4], { x: x + 1.6, y: 4.95, w: 2, h: 0.6, fontSize: 24, bold: true, color: HEX.grey, valign: 'middle' });
  }
  s.addNotes('Audio 1 làm mẫu 4\' (track 09): giáo viên nghĩ to "đề hỏi món gì → chờ 1 danh từ, tên món" → nghe 1 lần → chốt Jiaozi = dumplings, hình half-moon; chỉ paraphrase dumplings ↔ Jiaozi.\nAudio 2 luyện 8\' (track 10, Ex 15 sách trang Unit 5): 2\' đoán động từ cho 8 câu → nghe 1 lần → so cặp → hỏi miệng thêm số / nguyên liệu. Bạn B: dừng sau mỗi bước nấu, cho Bạn B nói động từ trước.\nĐáp án Ex 15: 1 mix · 2 chop · 3 mix · 4 chop · 5 cut · 6 roll · 7 fold · 8 boil.\nHỏi miệng thêm: flour → four cups · water → two cups · leave the dough → ten minutes · meat → lamb · seafood → shrimps · cut the dough into → twenty pieces.\nBẫy: mix xuất hiện 3 lần, bám nguyên liệu của từng câu.\nTrack 08 (Ex 07–08, 1:54) để nghe thêm, link Drive ở ghi chú slide Listening đầu.');

  // 8. Practice form
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Listening' });
  T(s, 'Practice: Saigon Kitchen booking form');
  const form = [['Class', 'Example: Vietnamese Street Food'], ["Customer's name", 'Daniel (1) ……………'], ['Phone number', '(2) ……………'], ['Date', 'Saturday, (3) …………… November'],
    ['Class starts at', '(4) …………… a.m.'], ['Number of people', '(5) ……………'], ['Price per person', '$ (6) ……………'], ['Food allergy', '(7) ……………'], ['Bring', 'a (8) ……………']];
  s.addTable(form.map((r, i) => [{ text: r[0], options: { bold: true, fill: { color: i ? HEX.mint : 'FDEEE9' } } }, { text: r[1], options: { italic: i === 0 } }]),
    { x: 0.6, y: 1.4, w: 7.6, colW: [2.6, 5.0], fontSize: 16, rowH: 0.52, border: { type: 'solid', pt: 0.75, color: 'C9D8CF' }, color: HEX.ink, fontFace: 'Calibri' });
  text(s, 'Complete the form. Write ONE WORD AND/OR A NUMBER for each answer.', { x: 8.6, y: 1.45, w: 4.1, h: 1.0, fontSize: 16, bold: true, color: HEX.tomato });
  const pl = [['0.75× first', 'aud/slow.mp3', '4:14', HEX.green], ['Real speed', 'aud/real.mp3', '3:23', HEX.tomato]];
  pl.forEach((p, i) => {
    const y = 2.8 + i * 1.6;
    card(s, 8.6, y, 4.1, 1.35);
    s.addShape(pres.shapes.OVAL, { x: 8.85, y: y + 0.22, w: 0.9, h: 0.9, fill: { color: p[3] }, line: { color: p[3] } });
    audio(s, p[1], 9.05, y + 0.42, 0.5);
    text(s, p[0], { x: 9.95, y: y + 0.25, w: 2.6, h: 0.45, fontSize: 18, bold: true });
    text(s, p[2], { x: 9.95, y: y + 0.72, w: 2.6, h: 0.4, fontSize: 15, color: HEX.grey });
  });
  s.addNotes('Audio 3 practice 8\': phát bản 0.75× (giới thiệu + 20 giây đọc đề, lời thoại bắt đầu 0:33), DỪNG sau mỗi câu (sau M-E-R-C-E-R [1:21], sau số điện thoại [1:35], sau twenty-first [2:04]…) cho Bạn B viết kịp; Bạn A làm liền không dừng → phát bản tốc độ thật để kiểm tra → chữa ở slide sau: từ khóa → người nói nói lại → vì sao loại bẫy.\nNối sang bài tập tuần 1\': bài nghe Thứ Hai, Thứ Ba trên SpeakBack là form completion 10 câu cùng dạng.');

  // 9. Answers
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Listening' });
  T(s, 'Answers: what did the speaker change?');
  const ans = [['1', 'Mercer', 'spell your last name → M-E-R-C-E-R'], ['2', '0903 552 178', 'office number 028 391… → Actually, no → mobile'], ['3', '21 / 21st', 'Friday 20th fully booked → Saturday 21st'], ['4', '9:30', 'It used to start at nine → Now nine thirty'],
    ['5', '3', 'At first four of us → but … three'], ['6', '35', '$45 with market tour → skip the tour'], ['7', 'peanuts', 'Nobody is vegetarian, love seafood → But … peanuts'], ['8', 'notebook', 'apron → we give you one → bring a notebook']];
  ans.forEach((a, i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.4 + Math.floor(i / 2) * 1.35;
    card(s, x, y, 5.95, 1.2, i % 4 < 2 ? HEX.mint : 'FFFFFF');
    s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.3, w: 0.6, h: 0.6, fill: { color: HEX.green }, line: { color: HEX.green } });
    text(s, a[0], { x: x + 0.2, y: y + 0.3, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    text(s, a[1], { x: x + 1.0, y: y + 0.13, w: 4.7, h: 0.45, fontSize: 20, bold: true, color: HEX.tomato });
    text(s, a[2], { x: x + 1.0, y: y + 0.62, w: 4.8, h: 0.45, fontSize: 14, color: HEX.grey });
  });
  s.addNotes('Transcript đầy đủ có mốc giờ (bản 0.75×) ở tab Alternatives của Claude Doc và cuối Word HS.\nChữa theo tư duy: từ khóa trên form → người nói nói lại bằng từ gì → vì sao loại bẫy.\n1 E đọc /iː/, R /ɑːr/, C /siː/ · 3 form in sẵn Saturday và November → chỉ viết số · 4 finishes at around twelve là giờ kết thúc, không hỏi · 6 form in sẵn $ · 8 form in sẵn "a" → 1 từ.');

  // 10-15. Vocab
  pres.addSection({ title: 'Vocabulary' });
  s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Vocabulary' });
  T(s, 'Vocabulary: 44 words');
  text(s, [{ text: 'A  Core words (12): learn to SAY them', options: { breakLine: true } }, { text: 'B  In the kitchen (10)', options: { breakLine: true } }, { text: 'C  Places & booking (12): for Listening', options: { breakLine: true } }, { text: 'D  Students & new workers (10)' }],
    { x: 0.7, y: 4.0, w: 7, h: 2.0, fontSize: 20, color: 'FFFFFF', paraSpaceAfter: 6 });
  text(s, '🔊 = click to hear the word + example (American English)', { x: 0.7, y: 6.3, w: 7, h: 0.4, fontSize: 14, color: HEX.gold });
  s.addImage({ path: 'picture.png', x: 8.0, y: 1.6, w: 4.9, h: 3.27 });
  s.addNotes('Chỉ bắt HS nhớ để NÓI 12 từ nhóm A; nhóm B–D nhận ra khi nghe / đọc là đủ.\nQuy tắc: rice, bread, meat, fruit, food, water không đếm được (some rice, không nói a rice / foods) · vegetables, noodles, eggs, snacks, dishes đếm được · be allergic to + N · phrasal verb nhấn vào giới từ: roll OUT, eat OUT · recipe đọc 3 âm tiết REC-i-pe.\nBấm loa để phát từ + câu ví dụ (giọng Mỹ, Kokoro).');

  const grp = { A: V.slice(0, 12), B: V.slice(12, 22), C: V.slice(22, 34), D: V.slice(34, 44) };
  const vocabSlide = async (title, items, cols, colorFill, notes) => {
    const sl = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Vocabulary' });
    T(sl, title);
    const rows = Math.ceil(items.length / cols), gw = 12.1, gh = 5.45;
    const cw = (gw - (cols - 1) * 0.2) / cols, ch = (gh - (rows - 1) * 0.15) / rows;
    const big = ch > 2;
    for (let i = 0; i < items.length; i++) {
      const v = items[i], x = 0.6 + (i % cols) * (cw + 0.2), y = 1.4 + Math.floor(i / cols) * (ch + 0.15);
      card(sl, x, y, cw, ch, i % 2 ? HEX.mint : 'FFFFFF');
      sl.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { type: 'none' }, line: { color: 'C9D8CF', width: 0.75 }, rectRadius: 0.12 });
      const ap = `aud/w${String(v.n).padStart(2, '0')}.mp3`;
      if (big) {
        await circle(sl, ICON[v.n], x + 0.2, y + 0.2, 0.95, colorFill);
        audio(sl, ap, x + cw - 0.6, y + 0.2, 0.42);
        sl.addText([{ text: v.w, options: { bold: true, fontSize: 24, breakLine: true } }, { text: v.st, options: { fontSize: 16, color: colorFill, bold: true } }],
          { isTextBox: true, x: x + 1.35, y: y + 0.2, w: cw - 2.0, h: 1.0, margin: 0, valign: 'top', color: HEX.ink });
        sl.addText([{ text: v.ipa, options: { breakLine: true, color: HEX.grey } }, { text: v.mean }],
          { isTextBox: true, x: x + 0.25, y: y + 1.35, w: cw - 0.5, h: ch - 1.5, fontSize: 18, margin: 0, valign: 'top', color: HEX.ink, paraSpaceAfter: 4 });
      } else {
        const d = Math.min(0.75, ch - 0.2);
        await circle(sl, ICON[v.n], x + 0.15, y + (ch - d) / 2, d, colorFill);
        audio(sl, ap, x + cw - 0.5, y + (ch - 0.36) / 2, 0.36);
        sl.addText([{ text: v.w, options: { bold: true, fontSize: 16 } }, { text: '   ' + v.st, options: { fontSize: 12, color: colorFill, bold: true, breakLine: true } },
          { text: v.ipa + '  ', options: { color: HEX.grey } }, { text: v.mean }],
          { isTextBox: true, x: x + d + 0.3, y: y + 0.06, w: cw - d - 0.9, h: ch - 0.12, fontSize: 12, margin: 0, valign: 'middle', color: HEX.ink });
      }
    }
    sl.addNotes(notes + '\n\nVí dụ (đọc trong audio):\n' + items.map(v => `${v.n}. ${v.w} – ${v.ex}`).join('\n'));
  };
  await vocabSlide('A. Core words (1–6)', grp.A.slice(0, 6), 3, HEX.tomato, 'Glance 3\' (16:05): chiếu 12 từ nhóm A + tranh, giáo viên đọc mẫu nhấn âm (in-GRE-di-ent, REC-i-pe, de-LI-cious, veg-e-TAR-i-an); HS đọc thầm, không đọc to cả bảng. Teach-back: Bạn A giảng từ 1–6.');
  await vocabSlide('A. Core words (7–12)', grp.A.slice(6, 12), 3, HEX.tomato, 'Teach-back: Bạn B giảng từ 7–12 (spicy → diet).');
  await vocabSlide('B. In the kitchen', grp.B, 2, HEX.green, 'Nhóm B: hoạt động trong tranh (Cooking day in a shared kitchen). Dùng khi quiz đầu buổi tuần sau: chỉ tranh → HS nói cụm. do the dishes (Mỹ) = wash up (Anh).');
  await vocabSlide('C. Places & booking', grp.C, 3, HEX.blue, 'Nhóm C: dùng ở Listening (cooking class, reservation, be allergic to, apron, check). cafeteria = canteen (Anh) · check = bill (Anh) · reservation = booking (Anh) · buffet đọc buf-FET.');
  await vocabSlide('D. Students & new workers', grp.D, 2, HEX.purple, 'Nhóm D: bối cảnh thực tập / mới đi làm, dùng ở bài mẫu Part 1 và Hot seat câu 8 (Work or studies).');

  // 16. Grammar
  pres.addSection({ title: 'Speaking' });
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Speaking' });
  T(s, 'Grammar: countable or uncountable?');
  const gcols = [['Countable', 'a / an · many · a few', 'an egg · two dishes · many snacks · noodles · vegetables', 'How many eggs?', HEX.green],
    ['Uncountable', 'some · much · a little', 'rice · bread · meat · fruit · water · food · salt', 'How much rice?', HEX.tomato]];
  gcols.forEach((g, i) => {
    const x = 0.6 + i * 3.95;
    card(s, x, 1.4, 3.75, 3.6);
    text(s, g[0], { x: x + 0.3, y: 1.6, w: 3.2, h: 0.5, fontSize: 22, bold: true, color: g[4] });
    text(s, g[1], { x: x + 0.3, y: 2.15, w: 3.2, h: 0.4, fontSize: 15, bold: true, color: HEX.grey });
    text(s, g[2], { x: x + 0.3, y: 2.7, w: 3.2, h: 1.3, fontSize: 16 });
    text(s, g[3], { x: x + 0.3, y: 4.2, w: 3.2, h: 0.5, fontSize: 18, italic: true, color: g[4] });
  });
  text(s, '✗ a rice · foods · many meat     ✓ some rice · food · much meat · a bowl of rice', { x: 0.6, y: 5.25, w: 7.7, h: 0.5, fontSize: 16, bold: true });
  text(s, 'Final -s: say it!', { x: 8.7, y: 1.4, w: 4, h: 0.5, fontSize: 22, bold: true, color: HEX.green });
  [['/s/', 'snacks · cups · tastes'], ['/z/', 'eggs · noodles · meals'], ['/ɪz/', 'dishes · sauces · oranges']].forEach((r, i) => {
    const y = 2.05 + i * 1.05;
    card(s, 8.7, y, 4.0, 0.9, i === 1 ? HEX.mint : 'FDEEE9');
    text(s, r[0], { x: 8.9, y: y + 0.18, w: 1.0, h: 0.55, fontSize: 22, bold: true, color: HEX.tomato, valign: 'middle' });
    text(s, r[1], { x: 9.9, y: y + 0.18, w: 2.7, h: 0.55, fontSize: 16, valign: 'middle' });
  });
  text(s, 'Process: First, … · Then, … · After that, … · Finally, …', { x: 8.7, y: 5.3, w: 4.0, h: 0.8, fontSize: 15, italic: true, color: HEX.grey });
  s.addNotes('Ngữ pháp trọng tâm Mindset U5: danh từ đếm được / không đếm được + some / any / many / much / a lot of.\n/s/ sau âm không rung /p t k f θ/ · /z/ sau âm rung và nguyên âm · /ɪz/ sau /s z ʃ tʃ dʒ/. SpeakBack bắt được khi HS thiếu đuôi -s.\nCho lý do Part 1: because + S + V · as + S + V · The main reason is that …\nFeeling: It makes me feel full / sleepy / at home · I feel really proud when … · To be honest, I hate …');

  // 17. Vòng Vocab
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Speaking' });
  T(s, 'Vocab round: close the book, remember');
  const vr = [['1', 'Glance', '3\'', 'Read group A silently', 'TbEye'], ['2', 'Brain dump', '3\'', 'Book closed: write every word you remember', 'TbPencil'], ['3', 'Teach-back', '4\'', "It's a word for… / You use it when… / For example, I…", 'TbMessages'], ['4', 'Taboo', '5\'', '4 new words + 1 old word. Don\'t say any part of it!', 'TbBan']];
  vr.forEach((r, i) => {
    const x = 0.6 + i * 3.08;
    card(s, x, 1.45, 2.88, 3.5, i % 2 ? HEX.mint : 'FDEEE9');
    text(s, r[2], { x: x + 1.7, y: 1.6, w: 1.0, h: 0.5, fontSize: 20, bold: true, color: HEX.grey, align: 'right' });
    return null;
  });
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.08, r = vr[i];
    await circle(s, r[4], x + 0.25, 1.65, 0.85, i % 2 ? HEX.green : HEX.tomato);
    text(s, `${r[0]}. ${r[1]}`, { x: x + 0.25, y: 2.7, w: 2.45, h: 0.5, fontSize: 20, bold: true });
    text(s, r[3], { x: x + 0.25, y: 3.25, w: 2.45, h: 1.5, fontSize: 15 });
  }
  s.addTable([[{ text: 'Word type', options: { bold: true, fill: { color: HEX.green }, color: 'FFFFFF' } }, { text: 'Taboo frame', options: { bold: true, fill: { color: HEX.green }, color: 'FFFFFF' } }],
    ['Noun', "It's a thing / a place … You use it to …"], ['Verb', "It's an action. You do it when …"], ['Adjective', 'It describes a food / a feeling. The opposite is …'], ['Phrase / idiom', "It's a phrase with … words. People say it when …"]],
    { x: 0.6, y: 5.15, w: 12.1, colW: [2.4, 9.7], fontSize: 14, rowH: 0.34, border: { type: 'solid', pt: 0.75, color: 'C9D8CF' }, color: HEX.ink, fontFace: 'Calibri' });
  s.addNotes('Vòng Vocab 15\' (16:05). Nói rõ với HS: quên, bí, phải cố nhớ là đang học thật.\n1 Glance 3\': chiếu slide A1–A2, đọc mẫu nhấn âm; HS đọc thầm.\n2 Brain dump 3\': gập sách, viết mọi từ nhóm A còn nhớ + nghĩa vào khung mục 2 Word HS → mở sách đối chiếu, mỗi từ đúng +1.\n3 Teach-back 4\': Bạn A từ 1–6 (dish → takeout), Bạn B từ 7–12 (spicy → diet); bạn nghe hỏi lại 1 câu Why? / When?; bí được nói 1 từ tiếng Việt. Bạn B: cho nhìn khung câu.\n4 Taboo 5\': mỗi bạn tự chọn 4 từ nhóm A / D + 1 từ ↺ Buổi 3 (itinerary, travel on a budget, take time off, memorable, explore, get away from it all), ghi giấy úp lại; 30 giây/từ; không nói phần nào của cụm; đoán đúng cả 2 cùng +1; bí nói 1 từ tiếng Việt thì mất điểm lượt đó. Bạn B chọn từ dễ: snack, spicy, menu, lunch break.\nLỗi hay gặp: đọc nghĩa tiếng Việt thay vì giải thích · foods, a rice · recipe đọc "ri-xíp" · quên đuôi -s.');

  // 18. A.R.E.+F
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Speaking' });
  T(s, 'Part 1 answer: A.R.E. + F');
  const aref = [['A', 'Answer', 'Yes, definitely. / Not really. / To be honest, …', HEX.tomato], ['R', 'Reason', 'because + S + V · as + S + V', HEX.gold], ['E', 'Example', 'For example, last week … · Yesterday, I …', HEX.blue], ['F', 'Feeling', 'It makes me feel … · I felt really … when …', HEX.purple]];
  aref.forEach((r, i) => {
    const x = 0.6 + i * 3.08;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.4, w: 2.88, h: 2.0, fill: { color: r[3] }, line: { color: r[3] }, rectRadius: 0.12 });
    text(s, r[0], { x: x + 0.25, y: 1.5, w: 1, h: 0.9, fontSize: 48, bold: true, color: 'FFFFFF' });
    text(s, r[1], { x: x + 1.2, y: 1.75, w: 1.6, h: 0.5, fontSize: 20, bold: true, color: 'FFFFFF' });
    text(s, r[2], { x: x + 0.25, y: 2.5, w: 2.45, h: 0.85, fontSize: 13, color: 'FFFFFF' });
  });
  text(s, 'Model (Work or studies): Do you usually have lunch with your coworkers?', { x: 0.6, y: 3.7, w: 12.1, h: 0.45, fontSize: 16, bold: true, color: HEX.green });
  s.addText([
    { text: 'Not really, to be honest. During my internship, I usually eat at my desk ', options: { color: HEX.tomato, bold: true } },
    { text: 'because our lunch break is quite short and I always have a deadline. ', options: { color: 'B7791F', bold: true } },
    { text: 'For example, last week I packed a lunch every day, just some rice, eggs and vegetables that I cooked for myself the night before. ', options: { color: HEX.blue, bold: true } },
    { text: "It makes me feel a bit lonely sometimes, but I'm happy that I save a lot of money.", options: { color: HEX.purple, bold: true } }],
    { isTextBox: true, x: 0.6, y: 4.25, w: 12.1, h: 2.0, fontSize: 18, margin: 0.15, fill: { color: HEX.mint }, valign: 'top' });
  text(s, 'Stuck? Who? · Where? · When? · Why? · How did you feel?', { x: 0.6, y: 6.45, w: 12.1, h: 0.4, fontSize: 15, italic: true, color: HEX.grey });
  s.addNotes('Part 1 Ladder 25\' (16:20). Bước 1 Mổ bài mẫu 4\': đọc to bài mẫu → hỏi Đâu là Answer? Reason? Example? Feeling? → HS tô 4 màu trên Word HS, gạch từ nối, khoanh 4 từ Vocab: eat at my desk, lunch break, pack a lunch, cook for myself.\nMàu trên slide: đỏ = A, vàng = R, xanh = E, tím = F.');

  // 19. Upgrade ladder
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Speaking' });
  T(s, 'Upgrade the answer: Do you like cooking?');
  card(s, 0.6, 1.4, 12.1, 0.8, 'FDEEE9');
  text(s, [{ text: 'Band 4:  ', options: { bold: true, color: HEX.tomato } }, { text: '"Yes, I like cook. It is delicious."' }], { x: 0.85, y: 1.55, w: 11.6, h: 0.5, fontSize: 20, valign: 'middle' });
  const steps = [['+ Reason', 'Yes, I really like cooking because …', HEX.gold], ['+ Example', 'For example, last … I made … for …', HEX.blue], ['+ Feeling', 'I felt really … when …', HEX.purple], ['Swap 2 words', 'made → cooked a … meal · my mom\'s way → my mom\'s …', HEX.green]];
  steps.forEach((st, i) => {
    const x = 0.6 + i * 3.08, y = 2.55 + (3 - i) * 0.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.88, h: 6.6 - y, fill: { color: st[2] }, line: { color: st[2] }, rectRadius: 0.12 });
    text(s, `Step ${i + 1}`, { x: x + 0.25, y: y + 0.2, w: 2.4, h: 0.4, fontSize: 14, bold: true, color: 'FFFFFF' });
    text(s, st[0], { x: x + 0.25, y: y + 0.6, w: 2.4, h: 0.5, fontSize: 22, bold: true, color: 'FFFFFF' });
    text(s, st[1], { x: x + 0.25, y: y + 1.25, w: 2.4, h: 1.6, fontSize: 15, color: 'FFFFFF', italic: true });
  });
  s.addNotes('Thang nâng cấp 6\': đọc câu band 4 (lỗi: like + V-ing → I like cooking; "It is delicious" không trả lời câu hỏi về việc nấu) → mỗi bậc ~1 phút → gọi 1 bạn đọc → sửa ngay.\nĐáp án tham khảo:\n1 Yes, I really like cooking because it helps me relax after a long day.\n2 … For example, last Sunday I made fried rice for my roommates.\n3 … I felt really proud when they asked for a second plate.\n4 … last Sunday I followed my mom\'s recipe and cooked a homemade dish of fried rice for my roommates …');

  // 20-21. Hot seat
  const qs = ['★ What kind of food do you like?', '★ Do you like spicy food?', 'How often do you eat out?', '★ Do you prefer homemade food or takeout?', 'Can you cook? What dishes can you cook?',
    '★ What did you have for dinner yesterday?', "Was there any food you didn't like when you were a child?", '★ (Work or studies) Where do you usually have lunch on a work or school day?', 'Do you think you have a healthy diet?', 'Would you like to take a cooking class? Why?'];
  for (const half of [0, 1]) {
    s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Speaking' });
    T(s, `Hot seat: 30 seconds each (${half + 1}/2)`);
    for (let i = 0; i < 5; i++) {
      const n = half * 5 + i, y = 1.4 + i * 1.0;
      card(s, 0.6, y, 9.3, 0.85, i % 2 ? 'FFFFFF' : HEX.mint);
      s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.13, w: 0.6, h: 0.6, fill: { color: HEX.tomato }, line: { color: HEX.tomato } });
      text(s, String(n + 1), { x: 0.8, y: y + 0.13, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      text(s, qs[n], { x: 1.6, y: y + 0.1, w: 8.1, h: 0.65, fontSize: 18, valign: 'middle' });
    }
    card(s, 10.2, 1.4, 2.5, 4.85, 'FDF3E1');
    text(s, 'Judge ticks', { x: 10.4, y: 1.55, w: 2.1, h: 0.45, fontSize: 17, bold: true, color: HEX.green });
    text(s, [{ text: '☐ A', options: { breakLine: true } }, { text: '☐ R', options: { breakLine: true } }, { text: '☐ E', options: { breakLine: true } }, { text: '☐ F', options: { breakLine: true } }, { text: '☐ New word' }], { x: 10.4, y: 2.1, w: 2.1, h: 2.4, fontSize: 18, paraSpaceAfter: 4 });
    text(s, 'Round 2: Why? · Who with? · How did you feel?', { x: 10.4, y: 4.65, w: 2.1, h: 1.4, fontSize: 13, italic: true, color: HEX.grey });
    text(s, '★ = warm-up question', { x: 0.6, y: 6.5, w: 6, h: 0.35, fontSize: 13, color: HEX.grey });
    s.addNotes(half === 0 ? 'Hot seat 12\': 1 bạn làm giám khảo bốc câu, hỏi, bấm 30 giây, tick A · R · E · F · Từ mới (mỗi ô +1); đổi vai sau 5 câu. Người thắng Vòng Vocab chọn trước. Giáo viên ghi lỗi, không ngắt lời.\nBạn B trả lời trước các câu ★ (1, 2, 4, 6, 8), được nhìn khung câu: I like … because … · For example, yesterday I … · It makes me feel …\nLỗi hay gặp cần ghi: foods, a rice, many rice (→ much rice) · thiếu -s (I like noodle) · thiếu -ing sau like / enjoy · quên quá khứ (yesterday I eat → ate) · trả lời 1 câu rồi dừng · lặp delicious, good, very.' : 'Vòng 2: giám khảo hỏi thêm Why? / Who did you eat with? / When was that? / How did you feel? / Can you cook it yourself?\nChữa nhanh 3\': đọc lại 2 câu hay nhất + 1 lỗi chung → chốt Mistake of the day; HS nói lại câu có lỗi cho đúng.');
  }

  // 22. Shadowing
  pres.addSection({ title: 'Shadowing' });
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Shadowing' });
  T(s, 'Shadowing: My lunch box');
  const sh = ['During my INTERNSHIP, / I USUALLY skip BREAKFAST / and grab‿a QUICK bite / near the OFFICE. //', 'But LAST month, / I STARTED to cook for mySELF. //',
    'On SUNDAYS, / I buy fresh VEGETABLES, / some EGGS / and a bit‿of CHICKEN, / and I PACK‿a lunch / for the WHOLE week. //', "It's HEALTHIER, / and it SAVES me a lot‿of MONEY. //",
    "My FAVORITE dish / is my MOM'S fried RICE. //", 'The RECIPE is SIMPLE, / but it TASTES like HOME. //', 'HONESTLY, / I feel really PROUD / when my COWORKERS / ask me for the RECIPE!'];
  const lh = [0.78, 0.55, 0.78, 0.55, 0.55, 0.55, 0.55];
  let yy = 1.35;
  sh.forEach((l, i) => {
    card(s, 0.6, yy, 10.2, lh[i] - 0.06, i % 2 ? 'FFFFFF' : HEX.mint);
    audio(s, `aud/sh${i + 1}.mp3`, 0.72, yy + (lh[i] - 0.06) / 2 - 0.19, 0.38);
    text(s, l.replace(/‿/g, '_'), { x: 1.25, y: yy + 0.04, w: 9.45, h: lh[i] - 0.14, fontSize: 16, valign: 'middle' });
    yy += lh[i];
  });
  card(s, 11.05, 1.35, 1.65, 2.1, HEX.green);
  audio(s, 'aud/shadow_full.mp3', 11.5, 1.6, 0.75);
  text(s, 'Whole text', { x: 11.1, y: 2.5, w: 1.55, h: 0.7, fontSize: 15, bold: true, color: 'FFFFFF', align: 'center' });
  text(s, '/ short pause · // long pause · CAPS = stress · _ = link (nối âm)', { x: 0.6, y: 6.35, w: 10, h: 0.35, fontSize: 13, color: HEX.grey });
  text(s, 'Final -s / -ed: Sundays · vegetables · eggs · saves · tastes · coworkers · started', { x: 0.6, y: 6.7, w: 10, h: 0.32, fontSize: 13, color: HEX.tomato });
  s.addNotes('Video shadowing 10\' (16:45), thay video bằng audio trong slide:\n1 Nghe – nhắc lại 4\': bấm loa từng câu (tốc độ chậm 0.85), HS nhắc lại từng cụm theo dấu /.\n2 Shadow 2 vòng 4\': bấm loa "Whole text", HS đọc cùng lúc.\n3 HS thay 2 chi tiết (món ăn, người nấu) và nói lại 2\'.\nTừ mới: internship · skip breakfast · grab a quick bite · cook for myself · pack a lunch · recipe · coworkers · proud.\nÂm R và âm cuối từ gốc (desk, chicken) SpeakBack không bắt được → giáo viên nghe bằng tai.');

  // 23. Wrap-up
  pres.addSection({ title: 'Wrap-up' });
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Wrap-up' });
  T(s, 'Exit ticket + this week on SpeakBack');
  card(s, 0.6, 1.4, 4.0, 4.9, 'FDEEE9');
  await circle(s, 'TbTicket', 0.9, 1.7, 0.9, HEX.tomato);
  text(s, 'Exit ticket (1 min)', { x: 0.9, y: 2.8, w: 3.5, h: 0.5, fontSize: 20, bold: true });
  text(s, 'Book closed. Write 3 new words + 1 sentence about you.', { x: 0.9, y: 3.4, w: 3.4, h: 1.4, fontSize: 17 });
  text(s, 'Deadline: Thurs 19 Nov 2026, 15:30', { x: 0.9, y: 5.3, w: 3.5, h: 0.7, fontSize: 15, bold: true, color: HEX.tomato });
  s.addTable([[{ text: 'Day', options: { bold: true, color: 'FFFFFF', fill: { color: HEX.green } } }, { text: 'Bạn A', options: { bold: true, color: 'FFFFFF', fill: { color: HEX.green } } }, { text: 'Bạn B', options: { bold: true, color: 'FFFFFF', fill: { color: HEX.green } } }],
    ['Thu 12 (17:00)', '2 × Part 1', '1 × Part 1 + 🧭'], ['Fri 13', '2 × Part 1', '1 × Part 1 + 🧭'], ['Sat 14', 'Part 2 cue card (STAR + F)', '1 × Part 1 + 🧭'], ['Sun 15', 'rest', 'rest'],
    ['Mon 16', 'Listening form Q1–5', '1 × Part 1 + listening (help)'], ['Tue 17', 'Listening form Q6–10', '1 × Part 1 + listening (help)'], ['Wed 18', 'Listening Part 2', '1 × Part 1 + listening (help)']],
    { x: 4.9, y: 1.4, w: 7.8, colW: [1.9, 2.9, 3.0], fontSize: 14, rowH: 0.5, border: { type: 'solid', pt: 0.75, color: 'C9D8CF' }, color: HEX.ink, fontFace: 'Calibri' });
  text(s, [{ text: 'speakback.pages.dev', options: { hyperlink: { url: 'https://speakback.pages.dev' }, bold: true } }, { text: '  · new tasks appear on their day · 🧠 Nhớ lại 3 min a day (deck dt4)' }], { x: 4.9, y: 5.7, w: 7.8, h: 0.5, fontSize: 15 });
  s.addNotes('Giao bài 5\' (16:55): exit ticket 1\' → công bố người thắng điểm cả buổi → mở SpeakBack, giới thiệu lịch 12–18/11 riêng từng bạn (bài tới ngày nào mới hiện ngày đó) + 🧠 Nhớ lại → công bố Mistake of the day.\nCâu nói: 📘 hướng dẫn → 📝 từ khóa A / R / E / F → 🎙 thử → 📤 nộp (máy chấm, tối đa 3 lần/câu). Bạn B có khung 🧭 phân tích câu hỏi.\nBài nghe: đọc chiến lược → đọc đề (Bạn A 30 giây · Bạn B 45 giây) → nghe 1 lần → nộp → xem giải thích + transcript.\nỞ nhà: tự điền bảng Find alternatives (từ delicious) trong Word HS; nghe lại audio shadowing.');

  // 24. Closing
  s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Wrap-up' });
  T(s, 'Mistake of the day');
  text(s, '……………………………………………', { x: 0.7, y: 4.1, w: 7.5, h: 0.8, fontSize: 28, color: 'D7E8DD' });
  text(s, SLOGAN, { x: 0.7, y: 6.0, w: 9, h: 0.6, fontSize: 18, bold: true, color: HEX.gold });
  await circle(s, 'TbMoodHappy', 9.6, 2.2, 2.6, HEX.tomato);
  s.addNotes('Ghi lỗi chung đáng nhớ nhất vào slide này trên lớp, cả lớp nói lại câu đúng.');

  await pres.writeFile({ fileName: 'Session 4_Food & Cooking.pptx' });
  await applyTheme('Session 4_Food & Cooking.pptx', THEME);
  console.log('written');
})().catch(e => { console.error(e); process.exit(1); });
