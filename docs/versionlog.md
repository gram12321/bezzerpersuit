# Version Log

## 🎯 **Core Principles**
- **ALWAYS use MCP GitHub tools** (`mcp_github_get_commit`, `mcp_github_list_commits`, `mcp_github_get_file_contents`) - NEVER use terminal git commands for commit inspection

- **MUST fetch full textual diffs before updating the log**: use `mcp_github_get_commit` with `include_diff: true` to request the commit patch. If that does not include full file patch text, do NOT update `docs/versionlog.md`. Instead follow these steps to obtain/verifiy the full changes:
   1. Call `mcp_github_get_commit` for the target commit SHA with `include_diff: true`.
 2. If full patch text is not present, fetch the commit's parent SHA (e.g., `mcp_github_get_commit` on the commit and read its `parents[0].sha` or request `sha + '^'`).
 3. For every file listed in the commit metadata, call `mcp_github_get_file_contents` for both the parent SHA and the commit SHA to retrieve the old and new file contents.
 4. Compute the textual diff locally (or rely on the `include_diff` patch when available) and verify changed lines and context. Only after verifying file-level diffs may you create or update an entry in `docs/versionlog.md`.

- **Do NOT update the version log with inferred or partial information.** If the full textual diffs or both-file contents cannot be obtained via MCP tools, stop and report back; await manual input or a full patch.

- **Placement & length rules:** New entries must be placed at the top of the file. Keep each entry concise (5–15 lines). Always include commit SHA, author, date, stats (+/-), and file-level summary (file paths + additions/deletions).

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

## ⚙️ **AI Agent Operational Rules**
- **Auth & failures:** If MCP calls return 401/403 or rate-limit errors, stop and report the exact error text and the SHAs you attempted. Do not edit the log when permission or rate issues occur.
- **MCP call examples:** Use the MCP helpers with these parameters: `mcp_github_get_commit(owner,repo,sha,include_diff:true)` and `mcp_github_get_file_contents(owner,repo,path,ref:sha)`.
- **Missing blobs:** If any file blob cannot be retrieved for the parent or commit SHA, mark the commit "incomplete" and do NOT create an entry; list missing files in your report.
- **Metadata-only policy:** Metadata/head-only checks are acceptable for verification passes, but creating or updating entries requires full textual diffs or both-file blobs as described above.
- **Post-edit checklist:** After editing, always read back `docs/versionlog.md`, verify the entry is at the top, ensure 5–15 lines, include the commit SHA and a link to the commit (`commit.html_url`), and report the edit summary.
- **PR & push policy:** Apply edits locally by default and include a suggested PR title/body. Do not push or open a PR without explicit user instruction.
- **When to request human review:** Ask for human review on DB migrations, conflicting commit messages, missing blobs, or very large changes (>1000 lines).

---

## Version 0.0014 - Better avatars
**Date**: 2025-12-10
**Commit**: `f4ebd5ca5d617f1b4d9d1234f88fc2bc402f5f40` — gram12321_laptop
**Stats**: +185 additions, -30 deletions

- Adds avatar picker to `ProfilePage`, expands `AVATAR_OPTIONS` and `getAvatarEmoji`, updates UI to show avatars in `LobbyArea`/`GameArea`, and adapts auth/db services to read/write avatar fields. Files: ProfilePage, avatars util, LobbyArea, GameArea, authService, usersDB, aiPersonalities, types.

## Version 0.0014 - Bugfixes
**Date**: 2025-12-09
**Commit**: `0b7d01ec2ad350f3afb10865895d8a11dcb5edb4`
**Stats**: +363 additions, -354 deletions

- Bugfix sweep addressing multiple UI and state regressions: major fixes in `src/components/pages/LobbyArea.tsx`, `src/hooks/useGameState.ts`, and `src/components/pages/WelcomePage.tsx`. Updated player-stats flows (`src/database/playerStatsDB.ts`) and small fixes in `usersDB`, `scoringService`, and related utilities. Minor `docs/versionlog.md` edit included.

## Version 0.0013a - Better AIlogic
**Date**: 2025-12-09
**Commit**: `dbc221df1ce72fc11a9f8db7ff2d679d4788fe5b`
**Stats**: +147 additions, -80 deletions

- Improvements to AI behavior and balancing: updates to `src/lib/services/ai/aiLogic.ts`, expanded `src/lib/constants/aiPersonalities.ts`, and adjustments in `src/hooks/useGameState.ts` and `src/lib/services/gameService.ts` to better integrate AI decisions.

Note: Merge commits `f0725c9267...` and `2fe65e3c0e...` (both 2025-12-10) are merge-only (no file changes) and are recorded here for traceability.

## Version 0.0013 - AI Personalities & Engine
**Date**: 2025-12-09
**Commit**: `82da10199877dc8e30c6d2629788a0df38a17502`
**Stats**: +607 additions, -112 deletions

- Introduces the AI personality system and companion docs: added `docs/ai_personality_system.md` and `src/lib/constants/aiPersonalities.ts`. Large refactor/expansion of `src/lib/services/ai/aiLogic.ts` to centralize AI decision logic, plus related updates in `lobbyService`, `questionService`, `useGameState`, and types. This change significantly grows AI capability and documents the system.

## Version 0.0012 - Question selection & adaptive difficulty (combined)
**Date**: 2025-12-09
**Commits**: `83188f2` `229c8a5` `50bc6ad` (combined)
**Stats (combined)**: +174 additions, -175 deletions

- Combined fixes for question selection and adaptive difficulty: updates to `src/lib/services/questionService.ts`, `src/hooks/useGameState.ts`, `src/database/usersDB.ts`, and `src/components/pages/WelcomePage.tsx`. Also includes multiple edits to `src/lib/services/adaptiveDifficulty.ts` (fixes, cleanup, and a later cleanup pass). These are grouped as a single logical 0.0012 release for clarity.

## Version 0.0011 - Cleaning & UI polish
**Date**: 2025-12-09
**Commit**: `abfbaa12f00264a038dd170d11ee29b2eb12a7bd`
**Stats**: +737 additions, -376 deletions

- UI and utility refactor: heavy updates to `src/components/pages/GameArea.tsx`, additions of `src/lib/utils/UIUtils.ts`, reworked question logic and `questionService` changes, removals/renames in avatar constants. Focused on cleaning, stability, and making UI utilities reusable.

## Version 0.0010 - User/Profile & Avatar logic (includes small cleanup)
**Date**: 2025-12-08
**Commit**: `e2818592253578b1dffea5a5eb5d845956eb2908` (+ grouped `0a7e4a49`)
**Stats**: +2308 additions, -201 deletions (major); plus a small cleaning commit grouped in this release

- Large feature rollout: adds `ProfilePage` component, `playerStatsDB`, auth service, expanded `WelcomePage`, many new questions/collections, and initial avatar constants. Adds DB migration `007_auth_system.sql` and documents. Small following cleaning commit (`0a7e4a49`) is grouped here as minor cleanup.

## Version 0.0009 - Question classes & collections
**Date**: 2025-12-08
**Commit**: `d9af95eb19bc5ee7f246da1bf0453ba5de63b1a1`
**Stats**: +316 additions, -16 deletions

- Introduces question classes and collections: updates `AdminDashboard` to surface collection controls and expands `src/lib/utils/types.ts` to support question-class typing. Minor updates to `questionsDB` and the question design guide.
 - Introduces question classes and collections: updates `AdminDashboard` to surface collection controls and expands `src/lib/utils/types.ts` to support question-class typing. Minor updates to `questionsDB` and the question design guide.

## Version 0.0007 - Adaptive difficulty & question tracking
**Date**: 2025-12-07
**Commit**: `828b4e200ee7c80c39fd95a2802c7c060abc10b3` — gram12321_laptop
**Stats**: +308 additions, -8 deletions

- Adds adaptive difficulty tracking and supporting services: new migration `database/migrations/006_add_adaptive_difficulty_tracking.sql`, and a new service `src/lib/services/adaptiveDifficulty.ts` (approx. 160 lines). Updates to question storage and retrieval (`src/database/questionsDB.ts`), game state flow (`src/hooks/useGameState.ts`), and `AdminDashboard` UI. Files: migration, adaptiveDifficulty service, questionsDB, AdminDashboard, useGameState, small admin/gameService adjustments.

## Version 0.0006 - New game mode & expanded question sets
**Date**: 2025-12-07
**Commit**: `b4b8237fd31413db9e18721a96114e6e0618713e` — gram12321_laptop
**Stats**: +1520 additions, -207 deletions

- Large content and gameplay update: adds strategic-category migrations and fills category/difficulty gaps (`database/migrations/004_add_strategic_category_questions.sql`, `database/migrations/005_fill_category_difficulty_gaps.sql` and legacy migrations), new/expanded question collections and docs (`docs/question_design_guide.md`, `docs/multiplayer.md`), significant logic updates in `src/hooks/useGameState.ts`, `src/components/pages/GameArea.tsx`, and expanded `src/lib/services/questionService.ts`. Adds `src/lib/constants/gameOptions.ts` and DB/admin updates. Files: migrations, docs, GameArea, LobbyArea, useGameState, questionService, adminDB, questionsDB, utils.

- NOTE: Prior unauthorized/draft entries for `0.0007` and `0.0006` were removed from this log earlier; these entries are now re-created here based on verified commit records (SHAs provided).

## Version 0.0008 - "I KNOW!" powerup & game options
**Date**: 2025-12-08
**Commit**: `c66fa26241189627e9ea1003ea569d5d848d000a` — gram12321_laptop
**Stats**: +1294 additions, -289 deletions

- Adds the 'I KNOW!' powerup behavior and introduces/adjusts game options: large gameplay logic updates in `src/components/pages/GameArea.tsx` and `src/hooks/useGameState.ts`, new/modified scoring logic (`src/lib/services/scoringService.ts` added), adjustments to `LobbyArea`, AI tweaks, and a small UI addition (`src/components/ui/accordion.tsx`). Also updates `package.json`/`package-lock.json`. Files: GameArea, useGameState, scoringService (new), LobbyArea, aiLogic, gameOptions, accordion UI, questionService, gameService.

---

## Version 0.0005 - Player lobby & NPC primitives
**Date**: 2025-12-07
**Commit**: `9af2ae22530c26f5dd119a0c8c466342270e9c0a` — gram12321_laptop
**Stats**: +669 additions, -112 deletions

- Adds the player lobby and primitive NPC support: new `src/components/pages/LobbyArea.tsx` and `src/lib/services/lobbyService.ts`, initial NPC AI primitives (`src/lib/ai/aiLogic.ts`), and updates to game state & UI (`src/hooks/useGameState.ts`, `src/components/pages/GameArea.tsx`, `src/App.tsx`). Also updates types and barrel exports. Files: LobbyArea (new), lobbyService (new), ai/aiLogic (new), useGameState, GameArea, App, service barrels, types.

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
