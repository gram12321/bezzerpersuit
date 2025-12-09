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

## Version 0.0007 - Identity & Logic Fixes
**Date**: 2025-12-09
**Commits**: (Uncommitted changes)

### Changes
- **Utils:** Updated `getDisplayName` in `src/lib/utils/utils.ts` to prioritize authenticated user's username over guest nickname.
- **Database Schema:** Removed deprecated `display_name` column from `public.users` table (migration applied).
- **Fix:** Resolved issue where game lobby would show "Test" (guest nickname) instead of the logged-in username.
- **Fix:** Fixed `handle_new_user` database function which caused 500 Internal Server Errors on signup by trying to insert into the removed `display_name` column.

## Version 0.0006 - Scoring Logic Update
**Date**: 2025-12-09
**Commits**: (Uncommitted changes)

### Changes
- **Scoring Service:** Updated `src/lib/services/scoringService.ts` (+20/-20 lines)
- **Logic Change:** Modified 'I KNOW!' powerup scoring. Now applies a penalty for incorrect answers regardless of whether the turn player answered correctly (previously, no penalty was given if the turn player was correct).

---

## Version 0.0005 - Authentication System Implementation
**Date**: 2025-12-08
**Commits**: (Uncommitted changes)

### Changes
- **Database Schema:** NEW `database/migrations/007_auth_system.sql` (194 lines - users, player_stats, game_sessions tables with RLS policies, triggers for auto-stats creation and updates)
- **Services:** NEW `authService.ts` (280 lines - sign up/in, Google OAuth, session management), `playerStatsService.ts` (238 lines - stats tracking, session management, accuracy calculations)
- **Components:** NEW `ProfilePage.tsx` (237 lines - user profile with stats grid, accuracy, best score, time played), `AuthPage.tsx` (212 lines - email/password + Google OAuth forms)
- **Types:** Updated `lib/types.ts` (+47 lines - User, PlayerStats, GameSession interfaces)
- **App Integration:** Updated `App.tsx` (+30/-7 lines - auth state management, profile/auth routing, conditional UI based on auth status)
- **Exports:** Updated `services/index.ts`, `pages/index.ts` for barrel exports
- **Architecture:** Simple Supabase Auth wrapper (~50 lines vs 200+ custom), supports anonymous play, auto-creates player_stats on signup, RLS policies for data security

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
