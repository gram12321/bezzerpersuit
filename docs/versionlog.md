# Version Log

## 🎯 **Core Principles**
- **ALWAYS use MCP GitHub tools** (`mcp_github2_get_commit`, `mcp_github2_list_commits`) - NEVER use terminal git commands
- **ALWAYS retrieve actual commit data** - Don't guess or assume what changed
- **Verify existing entries** against actual commits before adding new ones
- **Manual workflow**: If MCP is disabled, verify changes via git show (Not just git show head, we need the entire diff).

## 📋 **Entry Requirements**
1. **Use `mcp_github2_get_commit` with `include_diff: true`** to get exact file changes and stats
2. **Include specific details:**
   - Mark **NEW FILE:** with exact line counts (e.g., "NEW FILE: component.tsx (372 lines)")
   - Mark **REMOVED:** files that were deleted
   - Include file change stats (e.g., "42 additions, 15 deletions")
   - Note database schema changes explicitly
   
3. **Grouping commits:**
   - Related commits (same feature) can be grouped into one version entry
   - Each entry should cover 1-4 related commits if similar
   - Large refactors or feature sets may need separate entries

## 📂 **Repository Info**
- **Owner:** gram12321
- **Repository:** bezzerpersuit
- **Full URL:** https://github.com/gram12321/bezzerpersuit.git

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
