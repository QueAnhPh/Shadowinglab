# SpeakBack – quy tắc chung cho mọi lớp

File này là **nguồn chung** cho mọi project / lịch tự động soạn bài trên SpeakBack (lớp Đức–Thư, lớp Vân Anh, lớp sau này). Đọc file này trước khi soạn bài tập, flashcard hay sửa web. Có thay đổi dùng chung thì sửa ở đây (kèm 1 dòng ở mục Nhật ký thay đổi), không chép qua lại giữa các project. Repo công khai: không ghi họ tên đầy đủ, email, lỗi của HS, ghi chú nội bộ.

## 1. Flashcard (`decks` trong `data/lessons.json`)

- **Bộ theo topic Speaking của tuần dạy:** `title` = topic Speaking của buổi (vd. *Studies & School life*), không theo phần phát âm hay Listening. Gói bài tập tuần gắn `"deck"` = bộ của topic Speaking vừa dạy; buổi chỉ có Listening (không dạy Speaking) thì gói tuần dùng lại bộ của topic Speaking gần nhất, không tạo bộ mới.
- Mỗi buổi 1 bộ (`dt<N>` Đức–Thư, `va<N>` Vân Anh…), từ bảng vocab + Alternatives của buổi. Bài tập của buổi có `"deck": "<id>"`; web hỏi HS ôn flashcard trước khi vào bài. Bộ mở khi có bài cùng `session` đã mở với HS.
- **Gộp nhóm (từ 7/11/2026, nhắc lại 12/11/2026) — bắt buộc, để HS học cả cụm và so sánh các từ gần nghĩa:** 1 thẻ = 1 từ chính trong bảng Vocab + các từ / cụm **cùng nghĩa hoặc cùng họ** của nó: **synonym · collocation · phrasal verb · idiom**, giống 1 dòng bảng Alternatives (vd. *recipe · follow a recipe · a family recipe · try out · a recipe for disaster*). Web xếp hàng theo Vocab / Phrasal verb / Collocation / Idiom. Tối đa 8 từ, ≤ 3 từ mỗi loại (to hơn thì tách nhóm). Mỗi nhóm có 1 dòng **lưu ý** chung **so sánh** các từ trong thẻ: khác nhau ở đâu, Anh – Mỹ, thân mật / trang trọng, đếm được, giới từ.
  - **Không** tách mỗi collocation / phrasal verb thành 1 thẻ riêng. Từ cốt lõi (nhóm A, 12 từ) mỗi thẻ nên **≥ 3 từ**; nhóm B–D (hoạt động, nơi chốn, từ đời sống) có thể 1–2 từ khi không có từ cùng nghĩa.
  - **Cả bộ ≈ số từ bảng Vocab của buổi (~44–46 thẻ)**, mẫu: `decks/dt3.txt`, `decks/dt4.txt`. `make_deck.py` báo lỗi khi bộ > 55 thẻ hoặc số thẻ > 75 % số từ (= chưa gom), cảnh báo thẻ cốt lõi chỉ có 1 từ.
  - Từ chỉ gần nghĩa nhưng **ngược nghĩa / khác nghĩa** thì không gộp; nghĩa tiếng Việt của các thẻ không trùng nhau.
- `type` chỉ 4 giá trị **Vocab · Phrasal verb · Collocation · Idiom** (Noun/Verb/Adjective → Vocab, Noun phrase → Collocation). Band: 3–3.5 · 4–5 · 5.5–6.5 · 7–8 · 8.5–9 (8.5–9 tự có ⚠). IPA Mỹ, nhấn âm, grammar, câu ví dụ đúng bối cảnh HS. **Nghĩa không trùng** giữa các thẻ (lựa chọn đoán nghĩa lấy từ thẻ khác).
- File thẻ `tools/lesson/decks/<id>.txt` (mẫu `decks/dt1.txt`):
  ```
  #id=dt3
  #title=Travel & Vacations
  #session=3
  @A. Travel & Vacations: từ cốt lõi
  = kỳ nghỉ, đi nghỉ | vacation (Mỹ) = holiday (Anh) · go on vacation, không nói go to vacation
  vacation|Vocab|/veɪˈkeɪʃn/|va-CA-tion|3–3.5|go on / be on + vacation|The people in the picture are on vacation.
  getaway|Vocab|/ˈɡetəweɪ/|GET-a-way|5.5–6.5|a weekend getaway|We planned a weekend getaway to Da Lat.
  ```
  (dòng 8 cột `w|type|ipa|stress|band|mean|grammar|ex` = thẻ 1 từ, vẫn dùng được)
- Ghép vào web + kiểm tra: `python3 tools/lesson/make_deck.py tools/lesson/decks/<id>.txt data/lessons.json --for <hs,…> [--link <lessonId,…>]` (báo lỗi cột, type, band, nhóm quá 8 từ, nghĩa trùng; thay bộ cùng id).
- Bộ cũ dạng phẳng (mỗi thẻ 1 từ, có `w` ở ngoài) web vẫn hiện được; khi rảnh thì gộp lại theo cách trên.
- **🧠 Nhớ lại (từ 10/11/2026, mọi lớp):** chế độ ôn chính, theo nguyên tắc **retrieval** (tự nhớ ra thay vì nhìn lại) + **spacing** (giãn cách) + **interleaving** (trộn bộ cũ). HS thấy **nghĩa + câu ví dụ có chỗ trống** → gõ từ; bí thì gợi ý kiểu **Hangman** (ô chữ theo số chữ cái, đoán từng chữ, 6 tim; 💡 mở 1 chữ, chữ đầu trước; 🔊 nghe từ; 🏳 chịu). Không gợi ý → hộp +1; ≤ 2 gợi ý/lần sai → giữ hộp; nhiều hơn / chịu → về hộp 1 và hỏi lại sau 4 thẻ. Hộp 1–6 = hỏi lại sau 1 · 2 · 4 · 7 · 14 · 30 ngày. Mỗi lượt "hôm nay" = ≤ 20 thẻ đến hạn (mọi bộ đã mở) + ≤ 8 thẻ mới (bộ mới nhất), xáo trộn. Thẻ nhóm: gõ từ nào trong nhóm cũng đúng; hộp < 3 hỏi từ chính (`items[0]`), hộp ≥ 3 hỏi ngẫu nhiên từ trong nhóm. Lưu `localStorage sr:<hs>` + Firestore `users/{uid}.sr` (+ `srlog` theo ngày).
  - **Soạn thẻ để Nhớ lại chạy tốt:** từ đầu nhóm (`items[0]`) = từ dễ, hay dùng nhất; **câu ví dụ phải chứa đúng từ / cụm** (được chia -s/-ed/-ing) để web đục lỗ; nghĩa tiếng Việt đủ rõ để nhớ ra từ, không chỉ 1 chữ chung chung.
  - Web tự nhắc trước bài tập khi có ≥ 5 thẻ đến hạn (1 lần/ngày); không cần soạn bài riêng.
- **🎮 Game đồng nghĩa:** tự có cho mọi bộ có nhóm ≥ 2 từ (cuối phần flashcard + nút dưới mỗi bộ). Mỗi câu hiện 1 từ, ẩn các từ còn lại; SpeakBack đưa ngẫu nhiên 3–4 từ, HS chọn tất cả từ cùng nghĩa; 10 câu / lượt, lưu kỷ lục.

## 2. Bài nói (thẻ tự trả lời `free: true`, máy chấm khi HS bấm 📤)

- Ghi chú theo Part: Part 1 **A.R.E. + Feeling** (ô A / R / E / F) · Part 2 cue card (ô theo từng gợi ý; đề kể trải nghiệm thêm `"star": true` → ô Mở bài / S / T / A / R / F) · Part 3 A.R.E.A. (A1 / R / E / A2).
- `demo` = câu hỏi KHÁC cùng dạng + notes chỉ là từ khóa; không đưa bài mẫu trả lời câu hỏi thật.
- `guide: [HTML ngắn]` (tuỳ chọn) = khung 🧭 phân tích câu hỏi từng bước, cho HS cần hỗ trợ nhiều.
- **Shadowing = listen & repeat** (nghe từng câu mẫu rồi nói lại, kể cả hội thoại theo vai `roles`): luôn là bài **Speaking** (`skill: "Speaking"`, title bắt đầu bằng *Shadowing –*), không xếp vào Listening. Bài Listening chỉ gồm bài nghe làm đề (`type: "gap"`) và nghe chép (`dictation`).
- Máy chấm: 3 lần/câu, 15 lần/tuần/HS. Không cần lên lịch chấm tay; chỉ chấm tay khi hết lượt (skill `speakback-grading`).

## 3. Bài nghe (`type: "gap"`)

- Đề tự viết theo format IELTS thật; không chép audio / script sách. Tốc độ thật: Part 1 130–145 · Part 2 140–150 · Part 3 145–160 · Part 4 150–165 từ/phút.
- `rows` bọc từ khóa câu hỏi bằng `[[...]]`, ô trống `{n}`. `qs[n]`: `ans` (mọi cách viết), `form` = [dạng từ đúng, dạng gây nhiễu], `why` = **giải thích đáp án theo tư duy** (từ khóa → người nói nói lại bằng từ gì → vì sao loại bẫy), `hint` (tuỳ chọn) = gợi ý hiện dưới ô trước khi nghe, không lộ đáp án.
- `transcript`: mỗi lượt `{"sp", "t", "at": giây bắt đầu trong audio, "q": số câu}`; trong `t` khúc đáp án `**...**`, từ khóa / paraphrase / từ báo đổi ý `[[...]]`. Sau khi nộp web chạy transcript theo audio (dòng đang nói sáng lên, nhãn Câu N, bấm dòng để nghe lại) + nghe lại 0.75×.
- `strategy` dạy **linear thinking**: câu hỏi theo thứ tự audio, bám từ khóa câu kế tiếp, lỡ câu nào thì bỏ đi tiếp.
- `slowFirst: true` (tuỳ chọn) = cho nghe chậm 0.75× 1 lần để làm quen trước lượt làm thật.
- **Phân tích đáp án (bắt buộc, từ 9/11/2026):** không chỉ đưa đáp án. Mỗi câu có `kw` = `[[từ khóa trong đề, loại từ (N / V / Adj / Adv…), từ audio dùng thay]]` (web hiện 🔑 *từ đề* ⇄ **synonym / paraphrase**) và `why` = **mảng các bước** linear thinking (đọc đề / simplify → tín hiệu logic, từ điều kiện → bẫy bị loại → chốt). Trong `rows` và `transcript`, tô `[[...]]` các **danh từ, động từ, tính từ chính** của câu hỏi và từ đồng nghĩa trong audio, cả từ báo đổi ý / bẫy. `why` được dùng `<i>`, `<b>`.
- **Trắc nghiệm A/B/C (MCQ, từ 9/11/2026):** cùng `type: "gap"`; dòng trong `rows` dạng `"{11} câu hỏi có [[từ khóa]]"`; `qs[n]` = `{opts: {A, B, C}, ans: ["B"], kw, why, optWhy: {A: "vì sao loại", B: "vì sao chọn", C: …}}`, không có `form`. `instructions`: *Choose the correct letter, A, B or C.* Khi nghe HS đánh dấu từng phương án ✓ / ✗ / ? (giống worksheet Linearthinking). Viết script sao cho audio nhắc **cả 3 phương án**, 2 phương án bị loại bằng 1 trong 6 loại bẫy (nhắc rồi phủ định · đúng một phần · có thật nhưng không trả lời câu hỏi · nhượng bộ → đổi ý · bẫy từ · xưa – nay).

## 4. Mở bài theo ngày

- `opens: "YYYY-MM-DD"` = ngày làm; trước ngày đó HS không thấy bài (giáo viên thấy hết). `opensAt: "HH:MM"` (tuỳ chọn) = giờ mở trong ngày (vd. bài tối sau buổi học).
- **Gói bài tập theo ngày, hạn nộp = buổi học kế tiếp (mọi lớp, từ 9/11/2026):** mỗi gói tuần bắt đầu **sau buổi học** (bài đầu có `opensAt` = giờ tan học) và kết thúc **trước buổi học tuần sau**. Mục `homework` của gói có `deadline` = ngày buổi học kế tiếp + `deadlineAt` = **giờ bắt đầu buổi đó** (Vân Anh: Thứ Bảy `"17:30"` · Đức–Thư: Thứ Năm `"15:30"`). Web hiện *Deadline …, 17:30 (trước buổi học)*, qua giờ đó thì báo quá hạn.
- Dải **"Tuần này"** trên trang HS chạy theo chu kỳ bài tập (từ bài đầu tiên tới buổi học kế tiếp, ngày học có 📚), không theo Thứ Hai → Chủ nhật. Chủ nhật nghỉ: không đặt bài nào `opens` Chủ nhật.
- **Tiêu đề bài (`title`) chỉ ghi nội dung** (vd. *Part 1 – Study habits*, *Nghe Part 2 – Careers Fair (multiple choice)*), không ghi thứ / ngày: web tự hiện nhãn ngày `T2 9/11` từ `opens`, xếp bài theo ngày trong thư mục tuần, tách **✅ Đã làm** riêng (cả trang HS và màn giáo viên).
- Bài nghe tính **xong khi đã nộp** (điểm đúng / sai ghi riêng); chỉ bài **chưa xong** mới báo qua hạn.
- Tuần học dạng gì thì gói bài tập có dạng đó (Speaking: Part vừa dạy · Listening: dạng bài vừa đào sâu); được thêm, không được thiếu. Lịch từng ngày của mỗi lớp ghi ở project / lịch soạn đề của lớp đó.

## 5. Dữ liệu và đẩy lên

- `data/lessons.json` là nguồn duy nhất: chỉ thêm/thay mục theo id, giữ `indent=1`, `ensure_ascii=False`. `git pull --rebase` trước khi commit; kiểm tra bằng Playwright trước khi push.

## Nhật ký thay đổi

| Ngày | Thay đổi |
| --- | --- |
| 12/11/2026 | Flashcard: nhắc lại quy tắc gom nhóm (1 thẻ = 1 từ bảng Vocab + synonym / collocation / phrasal verb / idiom, lưu ý so sánh; bộ ≈ 44–46 thẻ); `make_deck.py` báo lỗi bộ chưa gom; `dt4` gom lại 85 → 46 thẻ |
| 10/11/2026 | Flashcard 🧠 Nhớ lại: nghĩa + câu đục lỗ → gõ từ, gợi ý kiểu Hangman, lặp giãn cách 1–30 ngày, trộn từ các bộ cũ; nhắc trước bài khi ≥ 5 thẻ đến hạn |
| 9/11/2026 | Màn giáo viên + trang HS: xếp theo tuần → ngày (nhãn `T2 9/11`), tách ✅ Đã làm; tiêu đề không ghi thứ; bài nghe nộp rồi là xong, chỉ bài chưa xong mới báo qua hạn |
| 9/11/2026 | Gói bài tập theo ngày, hạn nộp = buổi học kế tiếp (`deadlineAt` = giờ vào học); dải "Tuần này" theo chu kỳ bài tập; tuần học dạng gì thì bài tập có dạng đó |
| 9/11/2026 | Bài nghe: `kw` (🔑 từ khóa ⇄ synonym), `why` dạng các bước, MCQ A/B/C (`opts`, `optWhy`, đánh dấu ✓/✗/?) · Ghi âm: báo khi micro không thu được tiếng, Android Web Speech rỗng thì nghe lại bản ghi bằng Whisper |
| 7/11/2026 | Flashcard gộp nhóm đồng nghĩa + 🎮 Game đồng nghĩa; `make_deck.py` đọc định dạng `= nghĩa \| lưu ý` |
| 7/11/2026 | Flashcard theo topic Speaking của tuần dạy; gói tuần gắn `deck` của topic đó · gộp lại `va1` theo nhóm (`decks/va1.txt`) |
| 7/11/2026 | Part 1 thêm F (Feeling), Part 2 `star`, `guide`; bài nghe `hint`, `why`, `at` / `q` (transcript chạy), `slowFirst`; `opensAt` |
