# Hướng Dẫn Triển Khai Digital-Nervous Vào Dự Án Mới

---

## Trước hết: Chọn 1 trong 3 Cách Triển Khai

| Cách | Phù hợp khi | Độ phức tạp | Nhận update nguồn gốc |
|------|-------------|-------------|----------------------|
| **A. Git Submodule** | Muốn dùng nguyên bộ, theo kịp bản cập nhật | Thấp | ✅ Có |
| **B. Cherry-pick (Copy thủ công)** | Chỉ muốn lấy tinh hoa, tự custom hoàn toàn | Thấp | ❌ Không |
| **C. Hybrid (Submodule + Override)** | Muốn cả hai: theo kịp update + custom riêng | Trung bình | ✅ Có |

> [!TIP] Gợi ý cho bạn
> Nếu bạn muốn "chế biến thành thứ của riêng mình" → chọn **Cách B**. Nếu muốn nhận bản cập nhật từ nguồn gốc mà vẫn custom được → chọn **Cách C**.

---

## Cách A — Git Submodule (Dùng Nguyên Bộ)

Đây là cách repo gốc khuyến nghị. Digital-Nervous trở thành một "plugin" bên trong dự án của bạn.

### Bước 1 — Thêm Submodule
```powershell
# Vào thư mục dự án mới của bạn
cd C:\path\to\your-new-project

# Đảm bảo là git repo
git init  # (bỏ qua nếu đã là git repo)

# Thêm Digital-Nervous như submodule
git submodule add -b main https://github.com/Exia-thd/Digital-Nervous.git .antigravity/plugins/production-grade

# Khởi tạo
git submodule update --init --recursive
```

### Bước 2 — Build ForgeNexus (Code Intelligence)
```powershell
cd .antigravity/plugins/production-grade/forgenexus
npm install
npm run build
npm link
cd ../../../..
```

### Bước 3 — Quét Dự Án Của Bạn
```powershell
# ForgeNexus sẽ xây dựng Graph DB cho dự án của bạn
npx forgenexus analyze .
```

### Bước 4 — Commit
```powershell
git add .gitmodules .antigravity/
git commit -m "feat: add Digital-Nervous AI pipeline"
```

### Cấu trúc thư mục sau khi cài:
```
your-new-project/
├── .antigravity/
│   └── plugins/
│       └── production-grade/          ← Digital-Nervous (submodule)
│           ├── AGENTS.md              ← Bộ luật tối cao
│           ├── skills/                ← 55 AI Agent skills
│           ├── forgenexus/            ← Code Intelligence engine
│           └── scripts/               ← Setup utilities
├── .forgewright/                      ← Workspace (tự tạo khi chạy)
│   ├── project-profile.json           ← Fingerprint dự án
│   ├── code-conventions.md            ← Coding patterns phát hiện được
│   └── session-log.json               ← Lịch sử phiên làm việc
├── src/                               ← Source code dự án của bạn
└── .production-grade.yaml             ← Config tùy chỉnh (tạo thủ công)
```

---

## Cách B — Cherry-pick (Lấy Tinh Hoa, Tự Custom)

Không dùng submodule. Copy trực tiếp những phần cần thiết vào dự án riêng.

### Bước 1 — Tạo cấu trúc thư mục
```powershell
cd C:\path\to\your-new-project

# Tạo thư mục chứa
mkdir -p .ai-pipeline/protocols
mkdir -p .ai-pipeline/skills
mkdir -p .ai-pipeline/forgenexus
```

### Bước 2 — Copy các Protocols cốt lõi (Ưu tiên cao nhất)

Copy **10 file protocol** quan trọng nhất:

```powershell
$SRC = "C:\Users\thdat\Downloads\forgewright-main\Digital-Nervous"

# 10 protocols cốt lõi
Copy-Item "$SRC\skills\_shared\protocols\plan-quality-loop.md"      ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\quality-gate.md"           ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\guardrail.md"              ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\brownfield-safety.md"      ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\prompt-techniques.md"      ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\prompt-templates.md"       ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\graceful-failure.md"       ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\middleware-chain.md"       ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\session-lifecycle.md"      ".ai-pipeline\protocols\"
Copy-Item "$SRC\skills\_shared\protocols\self-healing-execution.md" ".ai-pipeline\protocols\"
```

### Bước 3 — Copy các Skill phù hợp với bạn

Chọn skill dựa trên công việc (xem bảng phía dưới):

```powershell
# Ví dụ nếu bạn làm Web Development:
Copy-Item -Recurse "$SRC\skills\software-engineer"    ".ai-pipeline\skills\"
Copy-Item -Recurse "$SRC\skills\frontend-engineer"    ".ai-pipeline\skills\"
Copy-Item -Recurse "$SRC\skills\code-reviewer"        ".ai-pipeline\skills\"
Copy-Item -Recurse "$SRC\skills\qa-engineer"           ".ai-pipeline\skills\"
Copy-Item -Recurse "$SRC\skills\solution-architect"    ".ai-pipeline\skills\"
Copy-Item -Recurse "$SRC\skills\debugger"              ".ai-pipeline\skills\"
Copy-Item -Recurse "$SRC\skills\production-grade"      ".ai-pipeline\skills\"
```

### Bước 4 — Copy ForgeNexus (Code Intelligence)

```powershell
# Copy toàn bộ engine
Copy-Item -Recurse "$SRC\forgenexus\*" ".ai-pipeline\forgenexus\"

# Build
cd .ai-pipeline\forgenexus
npm install
npm run build
cd ..\..
```

### Bước 5 — Tạo file AGENTS.md riêng của bạn

Thay vì copy nguyên `AGENTS.md` gốc, tạo **bản rút gọn** chỉ chứa những gì bạn cần:

```powershell
# Copy AGENTS.md gốc ra làm nền
Copy-Item "$SRC\AGENTS.md" ".ai-pipeline\AGENTS.md"
```

Sau đó mở file `.ai-pipeline\AGENTS.md` và sửa lại:
- Đổi tên dự án
- Bỏ những mode/skill bạn không cần (Game, XR, Mobile nếu không dùng)
- Thêm quy ước code riêng của công ty bạn
- Thêm link tới protocol riêng nếu có

### Bước 6 — Tạo config `.production-grade.yaml`

Tạo file `.production-grade.yaml` ở gốc dự án:

```yaml
# .production-grade.yaml — Config cho AI Pipeline  
codingLevel: 8          # 1-10 (8 = senior, ít comment giải thích)

planQuality:
  threshold: 9.0        # Điểm kế hoạch tối thiểu mới cho code
  maxIterations: 3

guardrail:
  enabled: true
  mode: warn            # warn | deny | dry_run

quality:
  minimum_score: 90     # Điểm chất lượng tối thiểu (0-100)

brownfield:
  auto_branch: true     # Tự tạo branch khi sửa code cũ
  baseline_tests: true  # Chạy test cũ trước khi sửa
```

### Cấu trúc thư mục hoàn chỉnh:
```
your-new-project/
├── .ai-pipeline/                      ← Tinh hoa Digital-Nervous
│   ├── AGENTS.md                      ← Bộ luật tùy chỉnh của bạn
│   ├── protocols/                     ← 10 protocol cốt lõi
│   │   ├── plan-quality-loop.md
│   │   ├── quality-gate.md
│   │   ├── guardrail.md
│   │   └── ...
│   ├── skills/                        ← Skill bạn chọn
│   │   ├── production-grade/
│   │   ├── software-engineer/
│   │   ├── frontend-engineer/
│   │   └── ...
│   └── forgenexus/                    ← Code Intelligence engine
│       ├── src/
│       ├── package.json
│       └── ...
├── src/                               ← Source code dự án của bạn
├── .production-grade.yaml             ← Config
└── .forgewright/                      ← Workspace (tự tạo lúc chạy)
```

---

## Cách C — Hybrid (Submodule + Override)

Cách này cho phép bạn vừa nhận update từ nguồn gốc, vừa có thể ghi đè (override) bằng custom của riêng.

### Bước 1 — Cài Submodule (giống Cách A)
```powershell
git submodule add -b main https://github.com/Exia-thd/Digital-Nervous.git .antigravity/plugins/production-grade
git submodule update --init --recursive
```

### Bước 2 — Tạo thư mục Override
```powershell
mkdir -p .ai-overrides/protocols
mkdir -p .ai-overrides/skills
```

### Bước 3 — Custom bằng cách Override

Khi muốn sửa một skill hoặc protocol, **không sửa trực tiếp trong submodule**. Thay vào đó, copy file ra `.ai-overrides/` rồi sửa ở đó:

```powershell
# Ví dụ: custom lại Software Engineer cho công ty bạn
Copy-Item ".antigravity\plugins\production-grade\skills\software-engineer\SKILL.md" `
           ".ai-overrides\skills\software-engineer-SKILL.md"

# Sửa file override theo ý bạn
# Khi AI chạy, nó sẽ đọc override trước, rồi mới đọc gốc
```

### Bước 4 — Tạo AGENTS.md Wrapper

Tạo file `AGENTS.md` ở gốc dự án, trỏ vào cả submodule lẫn overrides:

```markdown
# Custom AI Pipeline

## Skill Override Order
1. Đọc `.ai-overrides/skills/` trước (nếu có file tương ứng)
2. Fallback về `.antigravity/plugins/production-grade/skills/`

## Protocol Override Order  
1. Đọc `.ai-overrides/protocols/` trước
2. Fallback về `.antigravity/plugins/production-grade/skills/_shared/protocols/`

## Quy ước riêng
- [Thêm coding standard của công ty bạn ở đây]
- [Thêm tech stack bắt buộc ở đây]
```

### Cập nhật nguồn gốc (không mất custom):
```powershell
# Cập nhật submodule (code gốc)
git submodule update --remote .antigravity/plugins/production-grade

# Custom của bạn nằm ở .ai-overrides/ → không bị ảnh hưởng!
```

---

## Chọn Skill Nào Theo Nghề

| Nghề của bạn | Skills nên lấy | Protocols ưu tiên |
|-------------|----------------|-------------------|
| **Web Fullstack** | `production-grade`, `software-engineer`, `frontend-engineer`, `code-reviewer`, `qa-engineer`, `solution-architect`, `debugger` | `plan-quality-loop`, `guardrail`, `quality-gate` |
| **Backend / API** | `production-grade`, `software-engineer`, `api-designer`, `database-engineer`, `code-reviewer`, `qa-engineer`, `debugger` | `plan-quality-loop`, `guardrail`, `brownfield-safety` |
| **DevOps / Infra** | `production-grade`, `devops`, `sre`, `security-engineer`, `performance-engineer` | `guardrail`, `quality-gate`, `brownfield-safety` |
| **Mobile** | `production-grade`, `mobile-engineer`, `mobile-tester`, `frontend-engineer`, `qa-engineer` | `plan-quality-loop`, `guardrail` |
| **AI / ML** | `production-grade`, `ai-engineer`, `data-scientist`, `prompt-engineer`, `software-engineer` | `plan-quality-loop`, `prompt-techniques` |
| **Game Dev** | `production-grade`, `game-designer`, `unity-engineer` hoặc `godot-engineer`, `level-designer`, `game-audio-engineer` | `plan-quality-loop`, `game-test-protocol` |
| **Quản lý / BA** | `production-grade`, `business-analyst`, `product-manager`, `project-manager`, `solution-architect` | `plan-quality-loop`, `prompt-techniques` |

---

## Lộ Trình Triển Khai Từng Bước

### Phase 1 — Setup Cơ Bản (Ngày 1)
- [ ] Chọn cách triển khai (A, B, hoặc C)
- [ ] Copy/cài đặt theo hướng dẫn ở trên
- [ ] Tạo `.production-grade.yaml` với config mặc định
- [ ] Build ForgeNexus: `cd forgenexus && npm install && npm run build`

### Phase 2 — Kích Hoạt Code Intelligence (Ngày 2)
- [ ] Chạy `npx forgenexus analyze .` trên dự án
- [ ] Kiểm tra: `npx forgenexus status` → phải thấy danh sách symbol
- [ ] Thử query: `npx forgenexus query "authentication"` → phải ra kết quả

### Phase 3 — Tùy Chỉnh Theo Công Ty (Ngày 3-5)
- [ ] Sửa `AGENTS.md` → thêm coding standards riêng
- [ ] Sửa hoặc tạo Skills mới nếu cần chuyên gia đặc thù
- [ ] Cấu hình `guardrail` → thêm custom rules cho tech stack của công ty
- [ ] Test thử: yêu cầu AI "Add a login feature" → xem pipeline chạy đúng chưa

### Phase 4 — Tích Hợp CI/CD (Tuần 2, Tùy chọn)
- [ ] Copy `.github/actions/pr-review/` → tự động review PR
- [ ] Copy `.github/actions/auto-reindex/` → tự cập nhật Graph DB khi push
- [ ] Chỉnh sửa workflow cho phù hợp với hạ tầng CI/CD của bạn

---

## Checklist Kiểm Tra Sau Triển Khai

Chạy các lệnh sau để xác nhận mọi thứ hoạt động:

```powershell
# 1. ForgeNexus hoạt động?
npx forgenexus status

# 2. File config tồn tại?
Test-Path ".production-grade.yaml"

# 3. AGENTS.md tồn tại?
Test-Path "AGENTS.md"  # hoặc .ai-pipeline/AGENTS.md tùy cách bạn chọn

# 4. Có ít nhất 1 skill?
Get-ChildItem ".ai-pipeline/skills" -Directory | Measure-Object  # Cách B
# hoặc
Get-ChildItem ".antigravity/plugins/production-grade/skills" -Directory | Measure-Object  # Cách A/C
```

> [!IMPORTANT] Lưu ý quan trọng
> Sau khi triển khai, lần đầu tiên bạn chat với AI, hệ thống sẽ tự động tạo thư mục `.forgewright/` chứa `project-profile.json`, `session-log.json`... Đây là hành vi bình thường, không cần lo lắng.
