# OpenClaw Comprehensive Test Plan (v1.0)

## 1. Overview
This document outlines the strategy for validating the stability, compatibility, and robustness of the OpenClaw system. The goal is to ensure that all recently evolved skills (Calendar, Optimizer, Stabilizer, Lifecycle Manager) work individually and harmoniously within the automated workflows.

## 2. Test Environment
- **OS**: Linux (Current Env)
- **Runtime**: Node.js (v18+)
- **Network**: Active internet connection (for RSS, Weather, ClawHub)
- **Configuration**: `~/.openclaw/openclaw.json` (Must be valid)
- **Memory Store**: `~/.openclaw/workspace/skills/elite-longterm-memory/memory`

## 3. Test Cases

### 3.1 Unit & Functional Tests (Component Level)

| Component | Test Case ID | Description | Expected Result |
|-----------|--------------|-------------|-----------------|
| **Local Calendar** | CAL-001 | Add a new event | Event added to `calendar.json` |
| **Local Calendar** | CAL-002 | List events | JSON/Text output shows added event |
| **Skill Optimizer** | OPT-001 | Route "check calendar" | Recommends `local-calendar-skill` (Low Cost) |
| **Skill Optimizer** | OPT-002 | Route "summarize video" | Recommends `universal-web-summarizer` (High Cost) |
| **System Stabilizer**| STAB-001 | Health Check (Healthy) | All checks PASS, status HEALTHY |
| **System Stabilizer**| STAB-002 | Self-Heal (Missing Dir) | Recreates `memory/blog` if deleted |
| **Lifecycle Manager**| LIFE-001 | Audit Skills | Generates `audit-report.json` |
| **Lifecycle Manager**| LIFE-002 | Evolve Skills | Logs check to `EVOLUTION.md` |
| **Web Summarizer** | SUM-001 | Summarize Text URL | Returns text summary |
| **News Summary**   | NEWS-001 | Fetch & Format News | `fetch-news.js` outputs formatted markdown with AI/Tech sections |

### 3.2 Integration Tests (Workflow Level)

| Workflow | Test Case ID | Description | Expected Result |
|----------|--------------|-------------|-----------------|
| **Morning Routine** | FLOW-001 | Full Execution | 1. Health Check PASS<br>2. Evolution Audit DONE<br>3. News/Weather/Calendar Fetched<br>4. `daily-briefing-raw.md` created |

### 3.3 System Resilience Tests (Robustness)

| Scenario | Test Case ID | Description | Expected Result |
|----------|--------------|-------------|-----------------|
| **Config Loss** | RES-001 | Delete `memory` dir & Run Routine | `self-heal.js` detects missing dir, recreates it, and routine completes successfully. |
| **Network Fail** | RES-002 | Run without Net (Simulated) | Health check warns but allows proceed; News fetch fails gracefully without crashing script. |

## 4. Execution Strategy

We will create an automated test runner script `run-tests.js` to execute these cases sequentially.

### Proposed Test Runner Logic:
1.  **Setup**: Clean up test data (backup existing `calendar.json`).
2.  **Unit Tests**: Execute specific CLI commands for each skill and grep output.
3.  **Resilience Test**: Intentionally rename `memory` folder, run `health-check`, verify restoration.
4.  **Integration Test**: Run `./morning-routine.sh` (dry-run mode if possible, or check artifacts).
5.  **Teardown**: Restore original data.

## 5. Success Criteria
- All Critical paths (Health Check, Calendar Read/Write, News Fetch) must PASS.
- Self-Healing must successfully restore environment structure.
- No unhandled exceptions in the main workflow.

## 6. Next Steps
1.  Approve this plan.
2.  Implement `tests/run-tests.js`.
3.  Execute tests and generate `TEST_REPORT.md`.
