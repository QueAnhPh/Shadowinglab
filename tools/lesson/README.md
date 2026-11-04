# tools/lesson – dựng giáo án IELTS S&L (bản GV PDF + bản HS Word)

Không phải phần của web. Dùng cho việc soạn giáo án hằng tuần.

| File | Dùng |
| --- | --- |
| `build_pdf.py <dir> <N> [picture.png]` | `teacher.md` + `student.md` + `alternatives.md` → `Session N_Speaking.pdf` (mục lục, thanh điều hướng, tô màu `<mark>`) |
| `make_docx.js <dir> <N> [picture.png]` | `student.md` + `alternatives.md` → `Session N_Speaking_Student.docx` (cần `NODE_PATH` trỏ tới gói `docx`) |
| `figs.py` + `draw_example_beach.py <out.svg>` | vẽ tranh SVG (người que có tư thế), rồi `rsvg-convert -w 1200 -h 800` |
| `listening_tts.py <tempo> <out.mp3> <lines.txt>` | audio đề nghe tự viết bằng Kokoro; `tempo` 1 = tốc độ thật, 0.75 = bản chậm |
| `make_shadow_video.py <ref> <out.mp4> <sid> <kokoro_dir> "<title>"` | video shadowing chữ chạy |
| `lexfix.py <file>` | thêm từ thiếu vào `lexicon-us-en.txt` của Kokoro |

`lines.txt`: mỗi dòng `N|…` (người dẫn) · `H|…`, `K|…` (2 người nói) · `PAUSE|giây`.
