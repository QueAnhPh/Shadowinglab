# SpeakBack

Luyện shadowing tiếng Anh: nghe mẫu, nói, chấm phát âm từng từ.

Mở bằng Chrome (Android) hoặc Safari (iPhone).

## Phần nào tốn tiền API

| Phần | Dùng API key (Claude)? | Chạy ở đâu |
| --- | --- | --- |
| **📤 Nộp bài ở thẻ tự trả lời** (`"free": true`, Part 1/2/3 tự nói) → 🤖 Nhận xét nhanh | **Có**, chỉ chỗ này (`functions/api/feedback.js`) | Whisper chép lời trên máy HS → Cloudflare Function gọi Claude |
| Ghi âm, ghi âm lại, nghe lại | Không | Trình duyệt |
| Chấm từng từ: câu mẫu, âm cuối, shadowing | Không | Whisper trong trình duyệt |
| Nghe chép / điền từ | Không | So chữ trên máy |
| Audio Mindset, video TTS | Không | File có sẵn |
| Khung "Em đang ở đâu", màn giáo viên, tải bài nộp | Không | Trình duyệt + Firestore |
| 📝 Nhận xét giáo viên đã duyệt | Không | Đọc từ `data/lessons.json` |

Giới hạn để không lố budget (credit trả trước): mỗi câu **3 lượt** máy chấm, mỗi HS **9 lượt/tuần** (3 câu Part 1 Thứ Hai–Tư × 3 lần nộp) (mở lại Thứ Hai, giờ VN), giáo viên thử **10 lượt/tuần**. Hết lượt thì bài vẫn được nộp, giáo viên chấm tay. Đổi số ở đầu `functions/api/feedback.js` (`PER_CARD`, `PER_WEEK`).

Đường đi: trình duyệt (Whisper chép lời) → `/api/feedback` (Pages, ở Hồng Kông với HS ở VN) → service binding `CLAUDE` → Worker `speakback-claude` (`claude-relay/`, cố định ở Mỹ vì Claude API chặn máy chủ Hồng Kông) → Claude API. Key chỉ nằm trong secret `ANTHROPIC_API_KEY` của Pages.
