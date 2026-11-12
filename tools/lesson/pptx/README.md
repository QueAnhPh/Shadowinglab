# pptx – giáo án PowerPoint (từ 12/11/2026)

Giáo án chính mỗi buổi S&L = 1 file `.pptx` chiếu trên lớp; **speaker notes = giáo án giáo viên**. Thay cho PDF bản GV + video shadowing.

| File | Dùng |
| --- | --- |
| `build_pptx_example.js` | Mẫu đầy đủ (buổi Food & Cooking, 24 slide). Chép ra thư mục buổi, đổi nội dung, giữ bố cục / màu / cấu trúc |
| `pptx_tts_words.py` | `vocab.json` (lấy từ bảng Vocab trong `student.md`) → `aud/wNN.mp3` = từ + câu ví dụ (Kokoro sid 2, speed 0.85) |
| `pptx_tts_shadow.py` | câu shadowing → `aud/sh1..N.mp3` (0.85) + `aud/shadow_full.mp3` (0.95) |

Chạy:
```
python3 ../lexfix.py vocab.json     # thêm từ thiếu vào lexicon Kokoro
python3 pptx_tts_words.py; python3 pptx_tts_shadow.py
SKILL=<thư mục skill pptx> NODE_PATH=/opt/npm-tools/node_modules:$(npm root -g) node build_pptx_example.js
python3 $SKILL/scripts/office/validate.py "<file>.pptx"
```
- Thư mục buổi cần: `vocab.json`, `picture.png`, `aud/` (wNN, shN, shadow_full, 2 track Mindset `t<NN>.mp3`, `slow.mp3`, `real.mp3` = 2 bản audio đề tự viết).
- Từ vựng: icon `react-icons` (gi, tb) trong vòng tròn màu + IPA Mỹ + nhấn âm VIẾT HOA + nút loa (`addMedia` audio). Nối âm `‿` viết thành `_` (Calibri không có ‿).
- Kiểm tra: `validate.py`, render ảnh từng slide (soffice → pdftoppm) xem chữ tràn / chồng, đếm mp3 nhúng.
- Audio sách (Mindset) nhúng trong PPT → file PPT chỉ để ở nhánh `Teach` trên Drive, không đưa cho HS / không đưa lên repo.
