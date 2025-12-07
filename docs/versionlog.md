# Version Log

## 🎯 **Core Principles**
- **ALWAYS use MCP GitHub tools** (`mcp_github_get_commit`, `mcp_github_list_commits`) - NEVER use terminal git commands
- **ALWAYS retrieve actual commit data** - Don't guess or assume what changed
- **Verify existing entries** against actual commits before adding new ones
- **Fallback workflow**: If MCP is unavailable, use `git show <commit_hash>` to get full diff

## 📋 **Entry Requirements**
1. **Get detailed commit diff:** Use `mcp_github_get_commit` with `include_diff: true` to see actual code changes and understand what functionality was implemented
2. **Entry length:** 5-15 lines depending on scope - be concise but specific about functionality
3. **Include specific details:**
   - Mark **NEW FILE:** with exact line counts and key functions/features (e.g., "NEW FILE: component.tsx (372 lines - implements X, Y, Z)")
   - Mark **REMOVED:** files that were deleted
   - Describe what was implemented, not just what changed
   - Include file change stats (e.g., "42 additions, 15 deletions")
   - Note database schema changes explicitly
   
4. **Grouping commits:**
   - Related commits (same feature) can be grouped into one version entry
   - Each entry should cover 1-4 related commits if similar
   - Large refactors or feature sets may need separate entries

## 📂 **Repository Info**
- **Owner:** gram12321
- **Repository:** bezzerpersuit
- **Full URL:** https://github.com/gram12321/bezzerpersuit.git

---

## Version 0.0004 - Basic Game Alpha
**Date**: 2025-12-07
**Commit**: `93c8a73`

### Changes
- **Database Layer:** NEW `database/migrations/001_create_questions_table.sql` (66 lines), `src/database/questionsDB.ts` (163 lines CRUD), `src/database/adminDB.ts` (109 lines admin ops), moved supabase.ts from lib/ to database/
- **Services:** NEW `questionService.ts` (80 lines - fetchRandomQuestions with filters, difficulty adjustment), `gameService.ts` (49 lines - scoring), `adminService.ts` (75 lines - admin ops)
- **Components:** NEW `GameArea.tsx` (271 lines - 15s timer, scoring system timeRemaining × 10), `AdminDashboard.tsx` (274 lines - stats/management), updated `App.tsx` (+53/-5 navigation)
- **Hooks:** NEW `useGameState.ts` (141 lines - complete game state: start, timer, submit, next, end)
- **Types & Utils:** NEW `lib/utils/types.ts` (29 lines - Question, QuestionCategory, DifficultyScore), `lib/utils/utils.ts` (260 lines - formatNumber/Date/Time, getDifficultyLevel 9-tier system, random utils)
- **Docs:** Updated readme.md, PROJECT_INFO.md, AIDescriptions_coregame.md; removed ui_frontpage.md
- **Stats:** 28 files, 1,701 insertions(+), 250 deletions(-) | **MVP game loop complete** with proper architecture (UI → Services → Database)

---

## Version 0.0003a - Documentation & AI Configuration
**Date**: 2025-12-07
**Commit**: `c6a7d84`

### Changes
- **NEW FILE:** `.github/copilot-instructions.md` (159 lines) - Complete AI coding guidelines: project overview, dev rules (named imports, barrel exports, service layer), architecture patterns, directory structure, import patterns, workflow, component guidelines, roadmap
- **Updated:** `.cursor/rules/airules.mdc` (+4/-4) - MCP Tools Integration marked "(Disabled)", manual git/database workflow
- **Updated:** `docs/versionlog.md` (+34/-32) - Added manual workflow notes, repository info, reformatted entries
- **Updated:** `docs/AIDescriptions_coregame.md`, `docs/AIpromt_docs.md` - Changed from MCP tools to manual workflow
- **Stats:** 5 files, 199 insertions(+), 38 deletions(-)

---

## Version 0.0003 - Supabase
**Date**: 2025-12-07
**Commit**: `ed83e8b`

### Changes
- **NEW FILE:** `src/lib/supabase.ts` (11 lines) - Supabase client configuration
- **REMOVED:** `docs/github-mcp-setup.md` and `.agent/rules/mcp.json` (Disabled MCP)
- **Dependencies:** Installed `@supabase/supabase-js`
- **Stats:** 7 files changed, 171 insertions(+), 95 deletions(-)

---

## Version 0.0002 - MCP Setup & Tech Stack
**Date**: 2025-12-07
**Commit**: `6afc446`

### Infrastructure
- **UI Framework:** initialized ShadCN UI (`components.json`, `tailwindcss`)
- **Components:** Added `ui/button.tsx`, `ui/card.tsx`
- **React:** Initial app structure (`App.tsx`, `main.tsx`)
- **Stats:** 25 files changed, 4326 insertions(+), 13 deletions(-)

---

## Version 0.0001 & 0.0001a - Initial Commit & Docs Update
**Date**: 2025-12-07
**Commits**: `f19ab91`, `c25d750`

### Initial Setup
- **Documentation:** Restructured docs folder, created `PROJECT_INFO.md`, `AIDescriptions_coregame.md`
- **Rules:** Established AI rules (`airules.mdc`)
- **Readme:** Created initial project documentation
- **Stats:** Initial commit + 13 files changed in docs update

---

*Version history begins here. Future updates will follow the format outlined above.*
