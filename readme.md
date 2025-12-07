# Winery Management Game – AI Development Guide

**AI Agent Context**:  Online multiplayer quiz game. Will have (Primitive) NPC opponent for gametesting

## 🔧 Core Architecture
- **Framework**: React + TypeScript + Supabase
- **Styling**: Tailwind CSS + ShadCN UI (no custom CSS)
- **Data Flow**: Services → Database → Global Updates → Reactive UI

### 📱 Dual UI System (Mobile/Desktop) (For now just desktop)
The application implements a **Dual UI System** that provides optimized experiences for both mobile and desktop devices:

**Mobile Detection:**
- `useIsMobile()` hook detects screen width < 768px
- Automatic UI switching based on breakpoint
- Responsive design patterns throughout the application

**Mobile-First Components:**
- **Sidebar**: Desktop fixed sidebar → Mobile offcanvas Sheet component
- **Activity Panel**: Desktop fixed panel → Mobile sliding panel with floating trigger button
- **Data Tables**: Desktop tables → Mobile card-based layouts (Sales, Highscores, WineLog)
- **Navigation**: Touch-friendly mobile navigation with proper gesture support

**Implementation Pattern:**
```typescript
// Example dual UI pattern
const isMobile = useIsMobile();

return (
  <>
    {/* Desktop version */}
    <div className="hidden lg:block">
      <DesktopComponent />
    </div>
    
    {/* Mobile version */}
    <div className="lg:hidden">
      <MobileComponent />
    </div>
  </>
);
```

**Key Mobile Components:**
- `src/hooks/use-mobile.tsx` - Mobile detection hook
- `src/components/ui/shadCN/sidebar.tsx` - Responsive sidebar with Sheet integration
- `src/components/layout/ActivityPanel.tsx` - Dual activity panel system

### 🧠 Development Patterns

**CRITICAL RULES FOR AI AGENTS:**
- **NEVER make any effort for backwards compability, database save, data migration or anything like that. We are in dev phase. Database will simply be deleted if any compability issue arrice**:
- **ALWAYS use barrel exports**: `@/components/ui`, `@/hooks`, `@/lib/services`, `@/lib/utils`, `@/lib/constants`
- **ALWAYS use custom hooks**: 
- **ALWAYS use shared interfaces**: 
- **ALWAYS use service exports**: Game state 
- **ALWAYS use utility exports**: Formatting (`formatNumber`, `formatCurrency`, `formatDate`, `formatGameDate`, `formatPercent`),  ,  `getColorClass`, `getBadgeColorClasses`)
- **Business logic in services**: Never put calculations in components
- **Reactive updates**: Services trigger global updates, components auto-refresh


**Constants Directory (`@/lib/constants`):** Centralized configuration and data via barrel exports:
- Import from `@/lib/constants` (barrel). It re-exports:
  - `constants.ts` - Game initialization, 
  
**MCP Integration:** (Not yet setup)
- Supabase MCP configured in `.cursor/mcp.json`
- Both anon and service role keys available
- PAT required for database management

### 🗄️ **Dual Database Setup**

**Development Database (Local):** (Redundant info needs new acces)
- Supabase project: `uuribntaigecwtkdxeyw`
- Environment: `.env.local` (gitignored)
- Management: MCP tools (`mcp_supabase-dev_*`) for agentic operations
- Usage: `localhost:3000` with frequent resets

**Vercel Database (Staging):**
- Supabase project: `uuzoeoukixvunbnkrowi`
- Environment: Vercel Dashboard → Environment Variables
- Management: Manual SQL migrations via `migrations/` (data-preserving or full reset)
- Usage: `winemaker-omega.vercel.app` (stable for testing)

**Migration Process:**
1. Update dev database via MCP tools
2. Choose migration type:
   - **Data-preserving**: `migrations/vercel_migration_preserve_data.sql` (recommended for regular updates)
   - **Full reset**: `migrations/sync_vercel_schema.sql` (major breaking changes only)
3. Run chosen migration in Vercel Supabase SQL Editor
4. Verify Vercel deployment works

### 🔐 Row Level Security & Access Controls (Needs to be update for new database)
- All company-scoped tables now enforce RLS. Access requires either the company owner (`companies.user_id`) or a membership row in `user_settings` for the target `company_id`.
- Helper functions (`public.is_service_role`, `public.is_company_member`, `public.is_company_member_text`) centralize membership checks and must remain in sync across dev/Vercel databases.
- Maintenance helpers (`update_updated_at_column`, `clear_table`, `admin_clear_all_tables`) run with an explicit `public, pg_temp` search path to avoid hijacking.
- Migrations must be applied to both databases (MCP dev first, then Vercel SQL files) whenever RLS policies or helper functions change.

**Legacy Reference Documentation:**
None yet

**Local Storage Policy:**
- Only `lastPlayerId` is persisted for autologin. No full player object is stored. All live data is fetched from DB/services and updated via hooks.

### 🏗️ Database Schema
**Core Tables:**
**Data Flow**: Services → Database → Global Updates → Reactive UI

## Core Game Systems & Features

### 6. Player Interface  (Delay for now)
- **Login System**: Company selection, creation, user profile management
- **Company Management**: Multi-company support with switching and portfolio stats
- **Player Menu**: Dropdown navigation, notification center, admin dashboard
- **Winepedia System**: Interactive wine knowledge base with grape varieties, balance system visualization
- **Page Routing**: Company Overview, Vineyard, Winery, Sales, Finance navigation
- **Achievement System**: Progress tracking with filtering and categorization
- **Highscores**: Global leaderboard system with company value rankings

---

## 📋 **Implementation Status**
