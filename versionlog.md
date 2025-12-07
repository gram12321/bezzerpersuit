Version log
# Guideline for versionlog update for AI-Agents

## 🎯 **Core Principles**
- **ALWAYS use MCP GitHub tools** (`mcp_github2_get_commit`, `mcp_github2_list_commits`) - NEVER use terminal git commands
- **ALWAYS retrieve actual commit data** - Don't guess or assume what changed
- **Verify existing entries** against actual commits before adding new ones

## 📋 **Entry Requirements**
1. **Use `mcp_github2_get_commit` with `include_diff: true`** to get exact file changes and stats
2. **Include specific details:**
   - Mark **NEW FILE:** with exact line counts (e.g., "NEW FILE: component.tsx (372 lines)")
   - Mark **REMOVED:** files that were deleted
   - Include file change stats (e.g., "42 additions, 15 deletions")
   - Note database schema changes explicitly
   
3. **Grouping commits:**
   - Related commits (same feature) can be grouped into one version entry
   - Each entry should cover 1-4 related commits if similiar
   - Large refactors or feature sets may need separate entries

## 📂 **Repository Info** (Redundant)
- **Owner:** gram12321
- **Repository:** winemaker04
- **Full URL:** https://github.com/gram12321/winemaker04.git


### Responsive Design System
- **CSS Infrastructure:**
  - `src/index.css` - Enhanced responsive utilities (57 additions, 36 deletions, commit 11fc58a6)
  - Added mobile breakpoint definitions and responsive variables
  - Improved Tailwind responsive class support

- **Component-Wide Mobile Support:**
  - Updated 12 pages/components with mobile responsiveness (commit 11fc58a6)
  - Enhanced modal responsiveness across app (commits 07f9002a)
  - Consistent mobile-first approach with Tailwind breakpoints

### Infrastructure & Documentation
- **Vercel Deployment:**
  - `vercel.json` - New deployment configuration (7 lines, commit b10c52b5)
  - Production build optimizations

- **Documentation Updates (commit d4781b73):**
  - `readme.md` - Added mobile UI documentation (39 additions)
  - `docs/versionlog.md` - Updated version history (13 additions)

### Technical Architecture
- **Dual UI System Pattern:** Components conditionally render mobile vs desktop layouts using Tailwind responsive classes
- **Mobile-First Design:** 768px breakpoint for mobile/desktop switching
- **Touch Optimization:** Larger touch targets, improved gesture support
- **Performance:** Optimized rendering for mobile devices with conditional component loading

---

---

## 🧪 **Automated Testing Framework (Phase 0 & 1)**
- **Vitest Setup**: Added Vitest test runner with jsdom environment, TypeScript support, path aliases
- **Test Structure**: Created `tests/` folder with domain-based organization (`activity/`, `vineyard/`, `wine/`)
- **Phase 0 Complete**: Work calculator tests (`tests/activity/workCalculator.test.ts`) - 5 tests covering density adjustments, staff contributions, time estimates
- **Phase 1 Started**: 
  - **Vineyard Tests** (`tests/vineyard/yieldCalculator.test.ts`) - 11 tests for yield calculations, health/ripeness multipliers, edge cases
  - **Wine Tests** (`tests/wine/fermentationCharacteristics.test.ts`) - 14 tests for fermentation methods, temperature effects, characteristic clamping
- **Documentation**: Consolidated testing strategy into `tests/README.md` with roadmap and conventions
- **Total Coverage**: 30 passing tests covering core game mechanics (work, yield, fermentation)

---

*For versions 0.011 and earlier, see git commit history or archived documentation*
