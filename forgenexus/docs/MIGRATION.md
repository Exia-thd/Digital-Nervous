# Migration Guide: Digital-Nervous Anti-Hallucination System

## Upgrading from v1.0 to v2.0

### Overview

This guide helps you migrate from the basic Digital-Nervous system to the Anti-Hallucination system.

### Breaking Changes

#### 1. New Module Structure

**Before:**
```typescript
import { analyze } from 'Digital-Nervous';
```

**After:**
```typescript
import { createSkepticAgent, calculateConfidence } from 'Digital-Nervous/agents';
```

#### 2. Verification is Now Default

**Before:**
```typescript
const result = await analyze(repoPath);
```

**After:**
```typescript
// Verification is enabled by default
const result = await analyze(repoPath, { verify: true });

// To skip verification (legacy mode):
const result = await analyze(repoPath, { noVerify: true });
```

#### 3. Confidence in Output

**Before:**
```typescript
const result = await analyze(repoPath);
// result.content
```

**After:**
```typescript
const result = await analyze(repoPath);
// result.content
// result.confidence // NEW: confidence level and score
// result.warnings   // NEW: warnings about data quality
```

#### 4. Citation Format

**Before:**
```typescript
// No citation support
```

**After:**
```typescript
// All factual claims must be cited
// Format: [source:filepath:line]
// Example: "The login function [source:auth/login.ts:42] validates credentials"
```

### New Features

#### 1. Skeptic Agent

```typescript
import { createSkepticAgent } from 'Digital-Nervous/agents';

const skeptic = createSkepticAgent({
  llm: anthropicClient,
  calibration: 'strict' // 'moderate' | 'lenient'
});

const verification = await skeptic.verifyClaim({
  claim: 'Users can authenticate via JWT',
  evidence: [{ type: 'code', content: '...', source: 'auth.ts', relevance: 0.9 }]
});
```

#### 2. Confidence Scoring

```typescript
import { calculateConfidence } from 'Digital-Nervous/agents';

const confidence = calculateConfidence({
  type: 'wiki',
  evidence: [
    { type: 'code', content: '...', source: 'file.ts', relevance: 0.8 }
  ]
});

// confidence.score: 0-1
// confidence.level: 'high' | 'medium' | 'low' | 'critical'
// confidence.behavior: 'note' | 'warn' | 'block' | 'refuse'
```

#### 3. Freshness Warnings

```typescript
import { checkStaleness, warnIfStale } from 'Digital-Nervous/data/freshness';

const freshness = checkStaleness(metadata);

if (freshness.staleness !== 'fresh') {
  warnIfStale(metadata);
  // Shows warning about stale data
}
```

### Configuration Changes

#### Old Config (v1.0)

```json
{
  "Digital-Nervous": {
    "llm": "claude"
  }
}
```

#### New Config (v2.0)

```json
{
  "Digital-Nervous": {
    "llm": "claude",
    "antiHallucination": {
      "verification": {
        "enabled": true,
        "calibration": "moderate",
        "confidenceThreshold": 0.8
      },
      "freshness": {
        "freshThresholdHours": 24,
        "staleThresholdHours": 72
      },
      "citations": {
        "required": true,
        "format": "inline"
      }
    }
  }
}
```

### CLI Changes

#### Before

```bash
Digital-Nervous analyze
Digital-Nervous wiki auth
```

#### After

```bash
# Verification enabled by default
Digital-Nervous analyze
Digital-Nervous wiki auth

# Explicit verification
Digital-Nervous analyze --verify
Digital-Nervous wiki auth --verify

# Skip verification (fast mode)
Digital-Nervous analyze --no-verify
Digital-Nervous wiki auth --no-verify

# Strict mode (fail on low confidence)
Digital-Nervous wiki auth --strict

# Check freshness
Digital-Nervous status

# Run evaluation
Digital-Nervous evaluate
```

### Step-by-Step Migration

#### Step 1: Update Dependencies

```bash
npm install Digital-Nervous@2.0
```

#### Step 2: Update Imports

```typescript
// Old
import { analyze, query, impact } from 'Digital-Nervous';

// New
import { analyze, query, impact } from 'Digital-Nervous';
import { 
  createSkepticAgent,
  calculateConfidence,
  checkStaleness 
} from 'Digital-Nervous/agents';
```

#### Step 3: Add LLM Configuration

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const skeptic = createSkepticAgent({
  llm: client,
  calibration: 'moderate'
});
```

#### Step 4: Handle Confidence

```typescript
const result = await analyze(repoPath);

if (result.confidence.level === 'critical') {
  console.error('Content confidence too low');
  process.exit(1);
}

if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```

#### Step 5: Verify Claims (Optional)

```typescript
const verification = await skeptic.verifyClaim({
  claim: result.content,
  evidence: result.sources
});

if (!verification.verified) {
  console.error('Content verification failed:', verification.issues);
}
```

### Rollback

If you encounter issues, rollback is supported:

```bash
# Disable verification globally
FORCE_NO_VERIFY=1 Digital-Nervous analyze

# Or in config
{
  "Digital-Nervous": {
    "antiHallucination": {
      "verification": {
        "enabled": false
      }
    }
  }
}
```

### Common Issues

#### Issue: "Citations required but not found"

**Solution:**
```typescript
// Ensure your generation includes citations
const content = `
  The login function [source:auth/login.ts:42] handles authentication.
  It validates [source:auth/login.ts:45] the password against the hash.
`;
```

#### Issue: "Confidence too low"

**Solutions:**
1. Ensure graph data is fresh: `Digital-Nervous analyze --force`
2. Lower threshold: `--threshold 0.6`
3. Disable verification: `--no-verify`

#### Issue: "Stale data warning"

**Solution:**
```bash
Digital-Nervous analyze --force
```

### Support

For issues, run:
```bash
Digital-Nervous evaluate --verbose > debug.log
```

Then file an issue with the debug log attached.

