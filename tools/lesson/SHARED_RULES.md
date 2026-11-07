# SpeakBack – quy tắc chung cho mọi lớp

File này là **nguồn chung** cho mọi project / lịch tự động soạn bài trên SpeakBack (lớp Đức–Thư, lớp Vân Anh, lớp sau này). Đọc file này trước khi soạn bài tập, flashcard hay sửa web. Có thay đổi dùng chung thì sửa ở đây (kèm 1 dòng ở mục Nhật ký thay đổi), không chép qua lại giữa các project. Repo công khai: không ghi họ tên đầy đủ, email, lỗi của HS, ghi chú nội bộ.

## 1. Flashcard (`decks` trong `data/lessons.json`)

- **Bộ theo topic Speaking của tuần dạy:** `title` = topic Speaking của buổi (vd. *Studies & School life*), không theo phần phát âm hay Listening. Gói bài tập tuần gắn `"deck"` = bộ của topic Speaking vừa dạy; buổi chỉ có Listening (không dạy Speaking) thì gói tuần dùng lại bộ của topic Speaking gần nhất, không tạo bộ mới.
- Mỗi buổi 1 bộ (`dt<N>` Đức–Thư, `va<N>` Vân Anh…), từ bảng vocab + Alternatives của buổi. Bài tập của buổi có `"deck": "<id>"`; web hỏi HS ôn flashcard trước khi vào bài. Bộ mở khi có bài cùng `session` đã mở với HS.
- **Gộp nhóm (từ 7/11/2026):** 1 thẻ = 1 nhóm từ **đồng nghĩa / dùng thay nhau được trong cùng câu**; web xếp hàng theo Vocab / Phrasal verb / Collocation / Idiom. Tối đa 8 từ, ≤ 3 từ mỗi loại (to hơn thì tách nhóm). Mỗi nhóm có 1 dòng **lưu ý** chung: khác nhau ở đâu, thân mật / trang trọng, đếm được, giới từ. Từ không có đồng nghĩa = thẻ 1 từ; từ chỉ gần nghĩa hoặc ngược nghĩa không gộp.
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
- **🎮 Game đồng nghĩa:** tự có cho mọi bộ có nhóm ≥ 2 từ (cuối phần flashcard + nút dưới mỗi bộ). Mỗi câu hiện 1 từ, ẩn các từ còn lại; SpeakBack đưa ngẫu nhiên 3–4 từ, HS chọn tất cả từ cùng nghĩa; 10 câu / lượt, lưu kỷ lục.

## 2. Bài nói (thẻ tự trả lời `free: true`, máy chấm khi HS bấm 📤)

- Ghi chú theo Part: Part 1 **A.R.E. + Feeling** (ô A / R / E / F) · Part 2 cue card (ô theo từng gợi ý; đề kể trải nghiệm thêm `"star": true` → ô Mở bài / S / T / A / R / F) · Part 3 A.R.E.A. (A1 / R / E / A2).
- `demo` = câu hỏi KHÁC cùng dạng + notes chỉ là từ khóa; không đưa bài mẫu trả lời câu hỏi thật.
- `guide: [HTML ngắn]` (tuỳ chọn) = khung 🧭 phân tích câu hỏi từng bước, cho HS cần hỗ trợ nhiều.
- Máy chấm: 3 lần/câu, 15 lần/tuần/HS. Không cần lên lịch chấm tay; chỉ chấm tay khi hết lượt (skill `speakback-grading`).

## 3. Bài nghe (`type: "gap"`)

- Đề tự viết theo format IELTS thật; không chép audio / script sách. Tốc độ thật: Part 1 130–145 · Part 2 140–150 · Part 3 145–160 · Part 4 150–165 từ/phút.
- `rows` bọc từ khóa câu hỏi bằng `[[...]]`, ô trống `{n}`. `qs[n]`: `ans` (mọi cách viết), `form` = [dạng từ đúng, dạng gây nhiễu], `why` = **giải thích đáp án theo tư duy** (từ khóa → người nói nói lại bằng từ gì → vì sao loại bẫy), `hint` (tuỳ chọn) = gợi ý hiện dưới ô trước khi nghe, không lộ đáp án.
- `transcript`: mỗi lượt `{"sp", "t", "at": giây bắt đầu trong audio, "q": số câu}`; trong `t` khúc đáp án `**...**`, từ khóa / paraphrase / từ báo đổi ý `[[...]]`. Sau khi nộp web chạy transcript theo audio (dòng đang nói sáng lên, nhãn Câu N, bấm dòng để nghe lại) + nghe lại 0.75×.
- `strategy` dạy **linear thinking**: câu hỏi theo thứ tự audio, bám từ khóa câu kế tiếp, lỡ câu nào thì bỏ đi tiếp.
- `slowFirst: true` (tuỳ chọn) = cho nghe chậm 0.75× 1 lần để làm quen trước lượt làm thật.

## 4. Mở bài theo ngày

- `opens: "YYYY-MM-DD"` = ngày làm; trước ngày đó HS không thấy bài (giáo viên thấy hết). `opensAt: "HH:MM"` (tuỳ chọn) = giờ mở trong ngày (vd. bài tối sau buổi học).

## 5. Dữ liệu và đẩy lên

- `data/lessons.json` là nguồn duy nhất: chỉ thêm/thay mục theo id, giữ `indent=1`, `ensure_ascii=False`. `git pull --rebase` trước khi commit; kiểm tra bằng Playwright trước khi push.

## Nhật ký thay đổi

| Ngày | Thay đổi |
| --- | --- |
| 7/11/2026 | Flashcard gộp nhóm đồng nghĩa + 🎮 Game đồng nghĩa; `make_deck.py` đọc định dạng `= nghĩa \| lưu ý` |
| 7/11/2026 | Flashcard theo topic Speaking của tuần dạy; gói tuần gắn `deck` của topic đó · gộp lại `va1` theo nhóm (`decks/va1.txt`) |
| 7/11/2026 | Part 1 thêm F (Feeling), Part 2 `star`, `guide`; bài nghe `hint`, `why`, `at` / `q` (transcript chạy), `slowFirst`; `opensAt` |
