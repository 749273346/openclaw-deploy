# Plan: Generate Comprehensive Test Checklist

## Objective
Create a standardized `TEST_CHECKLIST.md` file to validate OpenClaw's stability, intelligence, and content capabilities.

## Proposed Checklist Structure

### 1. 🛡️ System Infrastructure (System Stabilizer)
- [ ] **Health Check**: Node.js env, Config integrity, Registry valid.
- [ ] **Storage Persistence**: `elite-longterm-memory` accessible.
- [ ] **Self-Healing**: Automatic directory reconstruction (simulated failure).
- [ ] **Network**: External connectivity (Google DNS).

### 2. 🧠 Intelligence & Routing (Skill Optimizer)
- [ ] **Cost-Aware Routing**: 
    - Low-cost task -> `local-calendar-skill` / `rss-parser`.
    - High-cost task -> `universal-web-summarizer`.
- [ ] **Token Estimation**: Verify router logs estimated token usage.
- [ ] **Lifecycle Audit**: `audit-skills.js` runs without error.

### 3. 📰 Content Capabilities (News & Summary)
- [ ] **RSS Feeds**: 
    - Google AI Blog fetch.
    - ArXiv AI papers fetch.
- [ ] **Weather**: `wttr.in` response valid.
- [ ] **Universal Summarizer**:
    - **Text**: Summarize standard blog post.
    - **Video**: Extract & summarize YouTube transcript.
    - **Image**: (Future) Vision capability check.
- [ ] **Calendar**: Event add/list/read.

### 4. ⚙️ Workflows (Automation)
- [ ] **Morning Routine**: `./morning-routine.sh` end-to-end execution.
- [ ] **Artifact Generation**: `daily-briefing-raw.md` created with >500 chars.
- [ ] **Blog Post**: (Manual) Agent successfully converts raw data to blog.

## Deliverables
- `TEST_CHECKLIST.md`: The actionable checklist file.
- `tests/manual_verification_guide.md`: Instructions for manual tests (e.g., Blog generation).
