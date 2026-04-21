# Session Deduplication — Middleware Protocol

> **Purpose:** Prevent repeated identical tool calls from bloating LLM context. When the same `toolName + args` is invoked within a deduplication window, return a cached result instead of re-executing. This saves ~90% of tokens on repeated commands like `git status`, `ls`, `find`, etc.

> **Hook:** `before_tool()` — runs on every tool call, before execution.

> **Position in chain:** Insert after Guardrail (④), before tool execution. Numbered **④b**.

> **Type:** Non-blocking optimization. If dedup fails, continue with normal execution.

## How It Works

```
User: "run tests"
Agent: [tool] run_command("npm test")
                    │
                    ▼
            ┌───────────────────────┐
            │ SessionDeduplication  │  ← intercepts EVERY tool call
            └───────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
   key = sha256(tool + args)  │  key NOT in dedupStore
         │                     │
    ┌────┴────┐               │
    │ cached? │               │
    └────┬────┘               │
      YES│NO                  │
         │                    │
    ┌────┴────┐              │
    │ return  │              │  Execute tool normally
    │ cached  │              │
    │ + summary│             │
    └─────────┘              │
         │                   │
         └───────────────────┘
                 │
         Store result in dedupStore
```

## Dedup Key Generation

The key must be:
- **Deterministic:** same tool+args always produces same key
- **Normalized:** arg ordering, whitespace, trailing commas don't affect key
- **Tool-specific:** `Write` with same content = same key; `Read` with same path = same key

```typescript
function normalizeArgs(args: Record<string, unknown>): string {
  // Sort keys alphabetically
  // Remove undefined/null values
  // Recursively normalize nested objects
  // Stringify with stable whitespace
}

function computeDedupKey(toolName: string, args: Record<string, unknown>): string {
  const normalized = normalizeArgs(args);
  return `${toolName}::${sha256(normalized)}`;
}
```

## Dedup Entry

```typescript
interface DedupEntry {
  key: string;
  toolName: string;
  argsHash: string;
  result: ToolResult;
  firstSeen: number;      // timestamp ms
  lastSeen: number;       // timestamp ms
  firstSeenTurn: number;  // turn number
  lastSeenTurn: number;   // turn number
  seenCount: number;
  resultTokens: number;   // estimated tokens in result
}
```

## Configuration

```yaml
# .production-grade.yaml
session_deduplication:
  enabled: true
  window_turns: 10        # deduplication window in turns
  window_ms: 300000       # time-based window (5 min)
  max_store_size: 500     # max entries in dedup store
  exclude_tools:          # tools never deduplicated
    - write_to_file
    - Read
    - EditNotebook
    - Bash  # bash deduplication is handled by shell-filter
  include_tools:          # tools to deduplicate (empty = all except excluded)
    - run_command
    - Grep
    - Glob
    - SemanticSearch
    - FetchMcpResource
  cache_reads: true       # cache Read/Grep results
```

## Return Value

When a duplicate is detected:

```typescript
{
  dedup: true,
  result: cachedResult,     // original tool result
  metadata: {
    seenCount: 3,
    firstSeenTurn: 1,
    tokensSaved: 450,
    summary: "🔄 [3× duplicate — first seen 2 turns ago, saved ~450 tokens]"
  }
}
```

The `summary` field is the only text injected into the LLM context, replacing potentially thousands of tokens of repeated output.

## Token Savings Model

```
Saved per dedup:
  = cached_result_tokens - summary_tokens
  ≈ (500-5000) - 25 = 475-4975 tokens per duplicate

Conservative estimate:
  10 duplicate git status in a session
  Without dedup: 10 × 800 tokens = 8,000 tokens
  With dedup:   1 × 800 + 9 × 25  = 1,025 tokens
  Savings: 87%
```

## Error Handling

| Scenario | Action |
|----------|--------|
| Dedup store unavailable | Continue without dedup (WARN log) |
| Key collision | Execute tool normally, don't cache |
| Cache miss | Execute tool, store result |
| Result too large to cache (>100KB) | Skip caching, execute normally |
| Memory pressure | Evict oldest entries (LRU) |

## Tool-Specific Behavior

| Tool | Dedup Strategy | Rationale |
|------|---------------|-----------|
| `run_command` | Hash cmd + args | Bash deduplication is in shell-filter |
| `Grep` | Hash pattern + path + flags | Same query = same results |
| `Glob` | Hash glob + path | Same pattern = same results |
| `SemanticSearch` | Hash query + target | Same query = same results |
| `FetchMcpResource` | Hash server + uri | Same resource = same content |
| `Read` | Hash path + offset + limit | Large reads, deduplication valuable |
| `Glob` | Hash glob + path | Repeated tree walks expensive |
| `Write` | **NEVER** | Side effects must always execute |
| `Bash` | Shell filter handles | `rtk`/`chop`/`snip` compress output |
| `Delete` | **NEVER** | Side effects must always execute |
| `EditNotebook` | **NEVER** | Side effects must always execute |
| `ReadLints` | Deduplicate | Repeated lint checks same output |
| `Glob` | Hash glob pattern | Same pattern = same results |

## Session Lifecycle

| Event | Action |
|-------|--------|
| `session_start` | Clear dedup store |
| `turn_close` | Sliding window: evict entries older than `window_turns` or `window_ms` |
| `tool_call` | Check dedup, cache result |
| `session_end` | Clear dedup store |

## Metrics to Track

```typescript
interface DedupMetrics {
  totalCalls: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;           // cacheHits / totalCalls
  totalTokensSaved: number;
  avgTokensSavedPerHit: number;
  byTool: Record<string, { hits: number; tokensSaved: number }>;
}
```

## Integration Points

| Component | Integration |
|-----------|------------|
| **Shell Filter (I-NEW-1.1)** | Shell filter compresses bash output BEFORE dedup checks it |
| **RTK Detection (I-NEW-1.3)** | RTK output flows through dedup middleware |
| **Memory (I-NEW-3)** | Dedup metrics stored as session facts by Memory middleware |
| **Tool Output Sandbox (I2)** | Sandbox compresses tool outputs before dedup caches them |

## References

- I-NEW-1.2 in `docs/improvement-roadmap-v2.md`
- Middleware Chain: `middleware-chain.md`
- Shell Filter: `shell-filter.md`

