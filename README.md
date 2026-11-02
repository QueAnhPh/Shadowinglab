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

Giới hạn để không lố budget (credit trả trước): mỗi câu **3 lượt** máy chấm, mỗi HS **15 lượt/tuần** (mở lại Thứ Hai, giờ VN), giáo viên thử **10 lượt/tuần**. Hết lượt thì bài vẫn được nộp, giáo viên chấm tay. Đổi số ở đầu `functions/api/feedback.js` (`PER_CARD`, `PER_WEEK`).
