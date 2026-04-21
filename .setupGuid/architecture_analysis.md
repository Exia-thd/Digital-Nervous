# Giải Phẫu Toàn Diện Source Code: Digital-Nervous (Digital-Nervous)

Chào bạn, đây là bản phân tích bóc tách cặn kẽ hệ thống **Digital-Nervous** (tên gốc Digital-Nervous). Bản phân tích này sẽ giúp bạn hiểu rõ từng linh kiện của source code này, nó chạy như thế nào, và làm sao để bạn có thể rã nó ra để độ/chế (custom) lại cho riêng mình.

> [!NOTE] Cốt lõi của hệ thống
> Đây **KHÔNG** phải là một công cụ sinh code (code generator) đơn thuần. Nó là một **Dây chuyền sản xuất phần mềm tự động bằng AI (AI Pipeline Orchestrator)**. Thay vì một con chatbot ngồi đợi lệnh, hệ thống này chứa **55 chuyên gia AI** ảo tự động phối hợp với nhau qua các giai đoạn: *Phân Tích -> Thiết Kế -> Lập trình -> Kiểm thử -> Triển khai.*

---

## 1. Cấu trúc Thư mục Chính (Directory Map)

Source code của bạn được chia thành các phân khu rất mạch lạc:

### Quy tắc tối cao
* **`AGENTS.md`**: Đây là bộ luật tối cao (Hệ điều hành) của hệ thống. File này chứa 10 nguyên lý (First-Principles, Production Grade...) và luồng hoạt động chính. Mọi AI Agent đều phải tuân theo file này.
* **`VISION.md`**: Tầm nhìn cốt lõi của toàn bộ dự án ("Phần mềm nên được tự động xây dựng chứ không phải quản lý thủ công").

### Các Phân khu Thư mục
* **`/skills/` (Nơi chứa các chuyên gia AI):** Trái tim của hệ thống. Chứa 56 thư mục đại diện cho 56 kỹ năng (ví dụ `software-engineer`, `product-manager`, `unity-engineer`, `sre`...). Mỗi kỹ năng có một file `SKILL.md` định nghĩa "tính cách", nhiệm vụ và giới hạn quyền hạn của Agent đó.
* **`/forgenexus/` (Bộ não hiển vi):** Đây là công cụ Code Intelligence được viết bằng TypeScript (sử dụng Tree-Sitter và KuzuDB). Nó quét toàn bộ dự án để hiểu xem "Hàm A gọi Hàm B ở file nào", giúp AI có khả năng đánh giá phạm vi ảnh hưởng (Blast Radius) trước khi sửa code. 
* **`/.agent/` & `/.github/` (Tự động hóa luồng):** Chứa các Workflows, Action scripts để chạy trên GitHub Actions (tự động phân tích Pull Request, tự động viết Wiki, tự động test bảo mật).
* **`/scripts/` (Công cụ Dev):** Chứa các bash/powershell scripts để bạn setup hệ thống nhanh (Cài đặt môi trường di động, cài đặt dự án...).
* **`/mcp/` (Model Context Protocol):** Giao thức kết nối với các công cụ bên ngoài theo chuẩn MCP của Anthropic.

---

## 2. Cách Hệ Thống Này Vận Hành (The Flow)

Khi một yêu cầu được đưa vào, hệ thống không gọi AI trả lời ngay. Nó vận hành theo luồng sau: 

1. **Chat Interpreter (Phân dịch):** Nhận diện xem bạn đang muốn làm gì (Web, Game, Mobile, AI, hay chỉ review code).
2. **Classify Mode (Chế độ):** Phân loại yêu cầu của bạn vào 1 trong 23 "Modes" (Ví dụ: `Full Build`, `Game Build`, `Harden`, `Optimize`).
3. **Pipeline Phân Tầng:**
   * **Giai đoạn DEFINE:** Gọi `Business Analyst` phân tích, `Product Manager` lên spec, `Solution Architect` vẽ hệ thống. -> **Gate 1 (Chờ bạn duyệt)**.
   * **Giai đoạn BUILD:** Gọi `Backend/Frontend/Unity Engineer` gõ code, sau đó để `QA Engineer` test chéo. -> **Gate 2 (Chờ bạn duyệt)**.
   * **Giai đoạn SHIP/SUSTAIN:** Gọi `DevOps` và `SRE` để tự động đẩy app lên server hoặc lên store.

> [!TIP] Đặc Quyền Song Song (Parallel Dispatch)
> Hệ thống áp dụng nguyên tắc tối đa tốc độ: Frontend và Backend Engineer có thể được chạy song song; QA Testing và Security Audit sẽ được quét cùng một lúc. Giúp tạo ra ứng dụng nhanh gấp nhiều lần so với tuần tự.

---

## 3. Chi Tiết Các Kỹ Năng Nổi Bật (AI Skills)

Dưới đây là một vài Agent (skill) đặc biệt đáng chú ý nếu bạn muốn tìm hiểu cách một tổ chức AI vận hành:

* **`production-grade` (Người quản lý - Orchestrator):** Đây là giám đốc dự án ảo. Bạn đưa yêu cầu cho nó, nó chia task cho từng nhân sự.
* **`business-analyst` & `solution-architect`:** Đào sâu vào yêu cầu kinh doanh, chọn đúng database (Postgres vs MongoDB), thiết kế APIs và không viết một dòng code nào cho đến khi kiến trúc hoàn hảo.
* **`game-.*` (Nhóm kỹ sư Game):** Rất độc đáo, hỗ trợ cả `unity-engineer`, `unreal-engineer`, `godot`, `roblox` đến `game-audio-engineer` và `level-designer`. Bạn có thể ra một prompt yêu cầu thiết kế vòng lặp kinh tế của game, các Agent này sẽ dựng thẳng Game Engine tương ứng.
* **`code-reviewer` & `security-engineer`:** Đóng vai làm người xét duyệt khó tính, phát hiện vòng lặp vô tận, lỗ hổng SQL Injection và Memory Leaks.
* **`skill-maker`:** Agent cực kỳ mạnh mẽ — **Nó là Agent có khả năng tự động tạo ra một Agent mới!** Nếu bài toán của bạn yêu cầu một kỹ năng chưa từng có, `skill-maker` sẽ tự code ra kỹ năng đó.

---

## 4. Hướng Dẫn "Độ Chế" (Customization Guide)

Để tùy biến nền tảng này thành "đồ chơi" của riêng bạn, bạn hãy nhắm tới các thứ sau:

### Thay đổi luật chơi (Root Level)
Mở file **`AGENTS.md`** lên. Tìm kiếm các Rules (Luật) trong đó và đổi lại theo quy trình quản trị dự án của công ty bạn. 
*Ví dụ: Bạn muốn mọi code sinh ra phải dùng `Tab 4 spaces` hoặc tuân thủ chuẩn `TailwindCSS` tuyệt đối? Chỉ cần sửa file này.*

### Thêm Agent Mới cho Công Ty Bạn
1. Vào thư mục `skills/`.
2. Copy thư mục `software-engineer` ra và sửa tên thành `web3-smart-contract-engineer` (nếu bạn làm Blockchain).
3. Mở file `SKILL.md` bên trong ra, thay đổi lại prompt, ví dụ: "Ngươi là chuyên gia viết hợp đồng thông minh Solidity, mọi dòng code phải optimize gas tối đa..."
4. Sửa lại luồng pipeline trong `AGENTS.md` (nếu chưa dùng Orchestrator linh hoạt) để hệ thống biết "gọi" nhân tài web3 này khi cần thiết.

### Hạ Tầng Code (ForgeNexus)
Nếu bạn có ngôn ngữ riêng (DSL) hoặc muốn dùng thuật toán tìm kiếm code khác, vào thư mục **`forgenexus/`**. Mã nguồn nằm trong `forgenexus/src` được viết bằng Typescript, tận dụng sức mạnh `KuzuDB` khá xịn, rất đáng để vọc nếu bạn thích hiểu cách máy phân tích code tĩnh (AST).

> [!WARNING] Cảnh Báo Khi Build Lại
> Vì `forgenexus` là linh kiện nội bộ, nên khi thay đổi code trong thư mục đó, bạn hãy nhớ chạy `npm run build` bên trong thư mục `forgenexus` để biên dịch lại mã nguồn công cụ AST lõi. Mọi luồng trong `Digital-Nervous` đều phụ thuộc vào bộ não phân tích này.

