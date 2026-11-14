# SpeakBack – hướng dẫn cho Claude

Đọc `tools/lesson/SHARED_RULES.md` trước khi soạn bài, flashcard hay sửa web.

## Context lớp: chỉ dùng Drive khi phiên KHÔNG có tool Projects

Thread trong project (có tool Projects) thì đọc / ghi file `claude/...` của project như bình thường, bỏ qua mục này. Chỉ khi phiên **không có tool Projects**: mọi chỗ trong prompt / lịch tự động nói "Projects", "project", `project_info`, `project_read`, `project_write` hay file `claude/<đường dẫn>` thì dùng Google Drive (connector Google_Drive):

| Lớp | Thư mục Drive | id |
| --- | --- | --- |
| Vân Anh | Claude Context – Vân Anh | `10ZMgTg9Ssl18vnN7MtqffsksUAFIYH2h` |
| Đức–Thư | Claude Context – Đức–Thư | `1eva1NsP0NpYbTNn18lS7eSTDbZFZVlbK` |

- **Đường dẫn:** phần sau `claude/` giữ nguyên thành thư mục con + tên file. Vd. `claude/decks/va3.txt` = `decks` › `va3.txt`; `claude/pptx/build_pptx_s4.js` = `pptx` › `build_pptx_s4.js`; `claude/pending_push/…` = `pending_push` › ….
- **Đọc:** `search_files` với `parentId = '<id thư mục>'` (đi dần xuống thư mục con) → `read_file_content` cho .md / .txt, `download_file_content` cho .js / .json / .py / .patch / file nhị phân.
- **Ghi:** `create_file` (`textContent` hoặc `base64Content`, đúng `contentMimeType`, `disableConversionToGoogleType: true`, `parentId` = thư mục đúng; thiếu thư mục con thì tạo folder). Ghi đè = tạo bản mới cùng tên rồi `trash_file` bản cũ.
- **Bỏ** bước kiểm tra tên project bằng `project_info`.
- **Không tìm thấy file cần đọc:** làm theo lộ trình trong prompt, dòng đầu báo cáo ghi **⚠️ Thiếu context trên Drive: <tên file>**.
