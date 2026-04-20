# Hướng Dẫn Tách Tinh Hoa — Digital-Nervous

Tài liệu này liệt kê **chính xác** những phần nào trong source code `Digital-Nervous` bạn nên rút ra, kèm theo **lý do tại sao**, **cách ứng dụng**, và **mức độ ưu tiên**.

---

## Tổng quan: 6 Khối Tinh Hoa Có Thể Tách Riêng

| # | Khối Tinh Hoa | Đường dẫn | Dùng để làm gì | Ưu tiên |
|---|--------------|-----------|----------------|---------|
| 1 | Anti-Hallucination Engine | `forgenexus/src/agents/` | Buộc AI không bịa đặt | 🔴 Cao nhất |
| 2 | Code Intelligence (AST + Graph) | `forgenexus/src/analysis/` | AI hiểu cấu trúc code thật sự | 🔴 Cao |
| 3 | RAG Pipeline | `forgenexus/src/rag/` | Tìm kiếm code thông minh | 🟡 Trung bình |
| 4 | Bộ Protocols (Quy trình vàng) | `skills/_shared/protocols/` | Quy trình làm việc chuẩn cho AI | 🔴 Cao nhất |
| 5 | Skill Templates (Prompt Engineering) | `skills/*/SKILL.md` | Hướng dẫn AI đóng vai chuyên gia | 🟡 Trung bình |
| 6 | MCP Tools Interface | `forgenexus/src/mcp/` | Cho AI gọi công cụ phân tích | 🟢 Tùy chọn |

---

## Khối 1 — Anti-Hallucination Engine 🔴

**Đường dẫn:** `forgenexus/src/agents/`

**Tại sao quan trọng nhất:** Đây là thứ mà 99% các dự án AI Agent khác KHÔNG CÓ. Thay vì để AI tự do bịa code, hệ thống này tạo ra một "phiên tòa nội bộ" bắt AI phải chứng minh mọi thứ nó viết ra.

### Các file cần lấy:

| File | Chức năng | Cách ứng dụng |
|------|----------|---------------|
| [skeptic.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/agents/skeptic.ts) | Agent hoài nghi — đối chiếu mọi claim của AI với bằng chứng thực | Nhúng vào pipeline AI của bạn: mỗi khi AI sinh ra output, đẩy qua Skeptic trước khi trả cho user |
| [synthesizer.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/agents/synthesizer.ts) | Agent tạo nội dung — sinh tài liệu/code có kiểm soát | Dùng thay cho việc gọi LLM trực tiếp |
| [multi-agent.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/agents/multi-agent.ts) | Luồng phối hợp Synthesizer ↔ Skeptic | Copy nguyên luồng này vào dự án của bạn |
| [confidence.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/agents/confidence.ts) | Tính điểm tự tin (0-1) với các hành vi theo ngưỡng | Rất hay — dùng để quyết định AI nên "từ chối trả lời" hay "cảnh báo" |
| [semantic-energy.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/agents/semantic-energy.ts) | Đo lường năng lượng ngữ nghĩa — phát hiện AI đang ấp úng | Dùng để phát hiện lúc AI không chắc chắn |
| [citations.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/agents/citations.ts) | TokenShapley — buộc AI trích dẫn nguồn cho mỗi câu | Ứng dụng cho RAG, tài liệu, hoặc bất kỳ task nào cần fact-checking |
| [prompts.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/agents/prompts.ts) | Tất cả system prompts cho Skeptic/Synthesizer | Tham khảo cách viết prompt chống bịa đặt |
| [llm-client.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/agents/llm-client.ts) | Client gọi LLM (hỗ trợ nhiều provider) | Dùng luôn hoặc tham khảo cách wrap API call |

### Cách ứng dụng nhanh:
```
Luồng code của bạn hiện tại:
  User hỏi → Gọi LLM → Trả kết quả

Luồng sau khi áp dụng:
  User hỏi → Synthesizer tạo bản nháp → Skeptic kiểm tra từng claim
  → Confidence tính điểm → Nếu > 0.7: trả kết quả | Nếu < 0.5: từ chối
```

---

## Khối 2 — Code Intelligence (AST + Graph DB) 🔴

**Đường dẫn:** `forgenexus/src/analysis/`

**Tại sao quan trọng:** Giúp AI "nhìn thấy" cấu trúc code thay vì chỉ đọc text. Đây là lý do tại sao hệ thống này sửa code ít hỏng hơn so với chatbot thường.

### Các file cần lấy:

| File | Chức năng | Kích thước | Ghi chú |
|------|----------|-----------|---------|
| [parser.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/analysis/parser.ts) | Parser chính — dùng Tree-Sitter phân tích AST của 10+ ngôn ngữ | 58KB | File lõi quan trọng nhất |
| [queries.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/analysis/queries.ts) | Truy vấn KuzuDB — tìm hàm, class, import relationships | 55KB | Kho query patterns cực kỳ giá trị |
| [indexer.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/analysis/indexer.ts) | Bộ lập chỉ mục — quét toàn bộ project vào Graph DB | 24KB | Chạy `forgenexus analyze` |
| [parallel.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/analysis/parallel.ts) | Worker pool — quét code đa luồng | 12KB | Tối ưu hiệu năng cho project lớn |
| [framework-detection.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/analysis/framework-detection.ts) | Tự nhận diện framework (Next.js, FastAPI, Spring...) | 9KB | Rất hay — giúp AI hiểu ngữ cảnh project |
| [import-resolver.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/analysis/import-resolver.ts) | Giải quyết `import` path xuyên file | 7KB | Giúp AI theo vết dependency |
| [detect-changes.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/analysis/detect-changes.ts) | So sánh code trước/sau khi sửa | 10KB | Dùng cho pre-commit hook |

### Cách ứng dụng nhanh:
```
1. Copy toàn bộ thư mục forgenexus/ vào dự án của bạn
2. cd forgenexus && npm install && npm run build
3. npx forgenexus analyze /đường-dẫn-project-của-bạn
4. Giờ bạn có Graph DB chứa toàn bộ cấu trúc code
5. Query: "Hàm nào gọi tới authenticateUser?" → Trả lời chính xác
```

---

## Khối 3 — RAG Pipeline 🟡

**Đường dẫn:** `forgenexus/src/rag/`

**Tại sao hay:** Hệ thống tìm kiếm code kết hợp BM25 (keyword) + Vector Search (ngữ nghĩa) + Reranker. Tốt hơn rất nhiều so với `grep` thông thường.

### Các file cần lấy:

| File | Chức năng |
|------|----------|
| [hybrid-search.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/rag/hybrid-search.ts) | Kết hợp BM25 + Vector cho kết quả chính xác hơn |
| [retriever.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/rag/retriever.ts) | Truy xuất context từ codebase kèm citations |
| [reranker.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/rag/reranker.ts) | Sắp xếp lại kết quả theo độ liên quan thực tế |
| [chunker.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/rag/chunker.ts) | Chia nhỏ code thành các đoạn có ngữ nghĩa (không cắt giữa hàm) |

### Cách ứng dụng:
Nếu bạn đang xây dựng AI chatbot hoặc Agent làm việc với codebase lớn, thay vì nhồi toàn bộ code vào prompt, hãy dùng RAG pipeline này để chỉ lấy đúng phần code liên quan.

---

## Khối 4 — Bộ Protocols (Quy trình vàng) 🔴

**Đường dẫn:** `skills/_shared/protocols/`

**Tại sao quan trọng nhất:** Đây là bộ SOP (Standard Operating Procedure) cho AI. Bạn không cần phải dùng cả hệ thống Digital-Nervous — chỉ cần copy các file `.md` này vào System Prompt của bất kỳ AI Agent nào bạn đang xây.

### Top 10 Protocols cần lấy ngay:

| # | File | Làm gì | Ứng dụng cho bạn |
|---|------|--------|------------------|
| 1 | [plan-quality-loop.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/plan-quality-loop.md) | Buộc AI lên kế hoạch trước khi code, chấm điểm 8 tiêu chí, tự cải thiện nếu dưới 9/10 | **Copy vào system prompt** — AI sẽ không bao giờ code bừa nữa |
| 2 | [quality-gate.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/quality-gate.md) | Kiểm tra chất lượng sau khi code (Build → Regression → Standards → Traceability) — chấm 0-100 | **Copy vào system prompt** — AI tự kiểm tra code mình viết |
| 3 | [guardrail.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/guardrail.md) | Chặn lệnh nguy hiểm (rm -rf, DROP TABLE, npm publish) trước khi chạy | **Phải có** — bảo vệ hệ thống khỏi AI phá hoại |
| 4 | [brownfield-safety.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/brownfield-safety.md) | Bảo vệ code cũ khi AI sửa — tạo branch, snapshot test, rollback tự động | **Rất cần** nếu AI sửa code production |
| 5 | [middleware-chain.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/middleware-chain.md) | Luồng 11 bước chạy trước/sau mỗi skill — đảm bảo không bỏ sót bước nào | Tham khảo kiến trúc pipeline |
| 6 | [prompt-techniques.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/prompt-techniques.md) | 5 kỹ thuật prompt an toàn + danh sách kỹ thuật bị CẤM (Tree of Thought, MoE...) | **Copy ngay** — tránh dùng prompt gây hallucination |
| 7 | [prompt-templates.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/prompt-templates.md) | Kho template prompt cho từng loại task (code, review, creative...) | Tham khảo khi viết prompt |
| 8 | [graceful-failure.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/graceful-failure.md) | Xử lý khi AI bị kẹt: retry logic, phát hiện vòng lặp vô tận, thoát an toàn | **Copy vào** — tránh AI chạy mãi không dừng |
| 9 | [session-lifecycle.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/session-lifecycle.md) | Quản lý phiên làm việc: load context → làm việc → lưu memory | Tham khảo cho hệ thống có nhiều phiên chat |
| 10 | [self-healing-execution.md](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/skills/_shared/protocols/self-healing-execution.md) | AI tự sửa lỗi khi code bị fail — retry thông minh, không lặp lại lỗi cũ | **Copy vào** — giảm số lần bạn phải can thiệp |

---

## Khối 5 — Skill Templates (Prompt Engineering Mẫu) 🟡

**Đường dẫn:** `skills/*/SKILL.md`

**Cách dùng:** Không cần lấy hết 55 skills. Chỉ lấy những skill phù hợp với công việc của bạn, rồi copy nội dung `SKILL.md` vào System Prompt.

### Gợi ý chọn Skill theo nghề:

| Nếu bạn làm... | Lấy các Skill này |
|----------------|--------------------|
| **Web Developer** | `software-engineer`, `frontend-engineer`, `code-reviewer`, `qa-engineer` |
| **DevOps / SRE** | `devops`, `sre`, `security-engineer`, `performance-engineer` |
| **Mobile** | `mobile-engineer`, `mobile-tester` |
| **Game** | `game-designer`, `unity-engineer` hoặc `godot-engineer`, `level-designer` |
| **AI / ML** | `ai-engineer`, `data-scientist`, `prompt-engineer` |
| **Quản lý dự án** | `product-manager`, `business-analyst`, `project-manager` |
| **Tất cả** | `production-grade` (Orchestrator — tự động gọi skill phù hợp) |

---

## Khối 6 — MCP Tools Interface 🟢

**Đường dẫn:** `forgenexus/src/mcp/`

**Khi nào cần:** Chỉ khi bạn muốn expose ForgeNexus như một MCP Server để các AI client (Claude, Cursor) gọi trực tiếp.

| File | Chức năng |
|------|----------|
| [tools.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/mcp/tools.ts) | 12 MCP tools (query, context, impact, rename, detect_changes...) |
| [cypher-executor.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/mcp/cypher-executor.ts) | Chạy truy vấn Cypher trên Graph DB |
| [resources.ts](file:///c:/Users/thdat/Downloads/forgewright-main/Digital-Nervous/forgenexus/src/mcp/resources.ts) | Expose dữ liệu Graph dưới dạng MCP Resources |

---

## Lộ Trình Áp Dụng Gợi Ý

> [!TIP] Bắt đầu từ đây
> Bạn không cần làm hết cùng lúc. Hãy áp dụng theo thứ tự ưu tiên sau:

### Tuần 1 — Nền tảng (Không cần code)
- [ ] Copy **Khối 4** (Protocols) vào System Prompt AI Agent của bạn
- [ ] Ưu tiên: `plan-quality-loop.md` + `guardrail.md` + `prompt-techniques.md`
- [ ] Chọn 3-5 Skill templates từ **Khối 5** phù hợp với nghề của bạn

### Tuần 2 — Code Intelligence
- [ ] Clone thư mục `forgenexus/` vào dự án
- [ ] Build + chạy `forgenexus analyze` trên codebase của bạn
- [ ] Tích hợp **Khối 2** (AST + Graph) vào workflow

### Tuần 3 — Anti-Hallucination
- [ ] Tích hợp **Khối 1** (Skeptic + Confidence) vào pipeline AI
- [ ] Setup ngưỡng confidence: `high: 0.9, medium: 0.7, low: 0.5, critical: 0.3`
- [ ] Test với các case AI hay bịa đặt nhất

### Tuần 4 — RAG + MCP (Tùy chọn)
- [ ] Nếu cần tìm kiếm code nâng cao: tích hợp **Khối 3**
- [ ] Nếu cần expose cho AI client: setup **Khối 6** MCP Server
