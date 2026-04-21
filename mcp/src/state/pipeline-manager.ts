import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Digital-Nervous Root Detection ──────────────────────────────────────
// Compiled entry: Digital-Nervous/mcp/build/index.js
// __dirname at runtime: Digital-Nervous/mcp/build
// Navigate up 2 levels to get Digital-Nervous

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MCP_BUILD_DIR = __dirname; // Digital-Nervous/mcp/build
const MCP_ROOT_DIR = path.dirname(MCP_BUILD_DIR); // Digital-Nervous/mcp
const Digital-Nervous_ROOT = path.dirname(MCP_ROOT_DIR); // Digital-Nervous

// Always use absolute, pre-computed path (never recalculate after chdir)
let _Digital-NervousRoot: string | null = null;
let _workspaceRoot: string | null = null;

function _getDigital-NervousRoot(): string {
  if (!_Digital-NervousRoot) {
    // Walk up from __dirname until we find package.json (MCP root)
    let dir = __dirname;
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(path.join(dir, 'package.json'))) {
        _Digital-NervousRoot = path.dirname(dir);
        return _Digital-NervousRoot;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    _Digital-NervousRoot = path.resolve(Digital-Nervous_ROOT);
  }
  return _Digital-NervousRoot;
}

// ─── Workspace Detection ────────────────────────────────────────────
// The workspace is where the agent is currently running (Cursor project)

export function getDigital-NervousRoot(): string {
  return _getDigital-NervousRoot();
}

export function setWorkspaceRoot(): void {
  if (_workspaceRoot) return; // already set

  // Try environment variables first (set by Cursor when calling MCP)
  let ws =
    process.env.CURSOR_WORKSPACE_ROOT ||
    process.env.CLASSD_WORKSPACE_ROOT ||
    process.env.AGENTS_WORKSPACE;

  if (!ws) {
    // Fallback: check if .Digital-Nervous exists in cwd
    const candidate = path.join(process.cwd(), '.Digital-Nervous');
    if (fs.existsSync(candidate)) {
      ws = process.cwd();
    }
  }

  if (!ws) {
    // Last resort: use Digital-Nervous_ROOT itself (dev mode)
    console.error(
      `[Digital-Nervous Global MCP] Warning: Could not detect workspace. Using Digital-Nervous_ROOT.`,
    );
    console.error(
      `[Digital-Nervous Global MCP] Set CURSOR_WORKSPACE_ROOT env var for multi-project support.`,
    );
    ws = _getDigital-NervousRoot();
  }

  _workspaceRoot = path.resolve(ws);
  process.chdir(_workspaceRoot);
  console.error(`[Digital-Nervous Global MCP] Workspace: ${_workspaceRoot}`);
}

export function getWorkspaceRoot(): string {
  if (!_workspaceRoot) {
    setWorkspaceRoot();
  }
  return _workspaceRoot!;
}

// ─── Pipeline State ────────────────────────────────────────────────

export interface PipelineState {
  currentPhase: number;
  currentMode: string | null;
  history: string[];
  status: 'IDLE' | 'IN_PROGRESS' | 'WAITING_FOR_GATE' | 'COMPLETED';
}

export const PIPELINE_PHASES = [
  'Phase 0: Project Initiation & Mode Selection',
  'Phase 1: Research & Discovery (PM/BA/Architect)',
  'Phase 2: Execution (BE/FE/Engine Engineers)',
  'Phase 3: QA & Hardening',
  'Phase 4: Release & Deployment',
];

export function resetWorkspaceRoot(): void {
  _workspaceRoot = null;
}

export { DEFAULT_STATE };

const DEFAULT_STATE: PipelineState = {
  currentPhase: 0,
  currentMode: null,
  history: [],
  status: 'IDLE',
};

function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getStateFile(): string {
  const wsRoot = getWorkspaceRoot();
  const fwDir = path.join(wsRoot, '.Digital-Nervous');
  ensureDirSync(fwDir);
  return path.join(fwDir, 'pipeline-state.json');
}

export function getState(): PipelineState {
  const stateFile = getStateFile();
  if (!fs.existsSync(stateFile)) {
    saveState(DEFAULT_STATE);
    return DEFAULT_STATE;
  }
  try {
    const raw = fs.readFileSync(stateFile, 'utf-8');
    const parsed = JSON.parse(raw) as PipelineState;
    if (
      typeof parsed.currentPhase !== 'number' ||
      !Array.isArray(parsed.history) ||
      !['IDLE', 'IN_PROGRESS', 'WAITING_FOR_GATE', 'COMPLETED'].includes(parsed.status)
    ) {
      console.error('State has invalid shape, returning default');
      return DEFAULT_STATE;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to read state, returning default', e);
    return DEFAULT_STATE;
  }
}

export function saveState(state: PipelineState) {
  const stateFile = getStateFile();
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf-8');
}

export function startPipeline(mode: string): string {
  const state = getState();
  state.currentPhase = 1;
  state.currentMode = mode;
  state.status = 'IN_PROGRESS';
  state.history.push(`Started pipeline in mode: ${mode}`);
  saveState(state);

  return `Successfully started pipeline in ${mode} mode. You are now at Phase 1: Research & Discovery. Follow the Digital-Nervous orchestrator instructions.`;
}

export function advancePhase(): string {
  const state = getState();
  if (state.status === 'WAITING_FOR_GATE') {
    return `Error: You cannot advance the phase yet. The current phase is frozen pending human-in-the-loop (HITL) gate approval.`;
  }

  if (state.currentPhase >= PIPELINE_PHASES.length - 1) {
    state.status = 'COMPLETED';
    state.history.push(`Pipeline completed.`);
    saveState(state);
    return `Success: Pipeline is now Fully Completed.`;
  }

  state.currentPhase += 1;
  const phaseName = PIPELINE_PHASES[state.currentPhase];
  state.history.push(`Advanced to ${phaseName}`);
  saveState(state);

  return `Successfully advanced to ${phaseName}. Check the Digital-Nervous instructions for roles required in this phase.`;
}

export function requestGateApproval(message: string): string {
  const state = getState();
  state.status = 'WAITING_FOR_GATE';
  state.history.push(`Requested Gate Approval: ${message}`);
  saveState(state);

  return `System is now locked. Ask the user for explicit approval to pass the gate: "${message}".`;
}

export function approveGate(): string {
  const state = getState();
  if (state.status !== 'WAITING_FOR_GATE') {
    return 'Error: System is not waiting for any gate approval.';
  }
  state.status = 'IN_PROGRESS';
  state.history.push('Gate approved by user.');
  saveState(state);
  return 'Gate successfully approved. Proceed to next step or advance phase.';
}

