# Bezzerpersuit - Multiplayer Quiz Game

**AI Agent Context**: Online multiplayer quiz game with real-time gameplay and NPC opponents for solo practice.

## 🔧 Core Architecture
- **Framework**: React + TypeScript + Vite + Supabase
- **Styling**: Tailwind CSS + ShadCN UI (no custom CSS)
- **Data Flow**: Services → Database → Global Updates → Reactive UI
- **Real-time**: Supabase real-time subscriptions for multiplayer synchronization

### 📱 Responsive Design (Desktop First, Mobile Later)
The application will implement a **responsive design system** optimized for desktop initially, with mobile support planned:

**Planned Mobile Features:**
- Responsive breakpoints using Tailwind CSS
- Touch-friendly UI components
- Adaptive layouts for different screen sizes

**Implementation Pattern:**
```typescript
// Example responsive pattern
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

### 🧠 Development Patterns

**CRITICAL RULES FOR AI AGENTS:**
- **NO BACKWARDS COMPATIBILITY**: Dev phase - database resets acceptable, no migrations needed
- **ALWAYS use barrel exports**: `@/components/ui`, `@/hooks`, `@/lib/services`, `@/lib/utils`, `@/lib/constants`, `@/database`, `@/pages`
- **ALWAYS use custom hooks**: For state management and data loading
- **ALWAYS use shared interfaces**: Consistent TypeScript interfaces across the app
- **Business logic in services**: Never put calculations in components
- **NO business logic in pages/components**: UI presentation only
- **NO direct database access from UI**: Always go through services → database layer
- **Reactive updates**: Services trigger global updates, components auto-refresh

### 🏗️ **Architecture Layers (STRICT SEPARATION)**

```
User Interaction → Pages (UI) → Hooks (State) → Services (Logic) → Database (CRUD) → Supabase
```

**Layer Responsibilities:**
1. **Pages** (`src/pages/`) - UI only, uses hooks, NO business logic
2. **Hooks** (`src/hooks/`) - React state management, uses services
3. **Services** (`src/lib/services/`) - Business logic, uses database layer
4. **Database** (`src/database/`) - CRUD operations only, Supabase queries

**Import Rules:**
- ✅ Pages → Hooks → Services → Database
- ❌ Pages → Services (use hooks instead)
- ❌ Pages → Database (use hooks instead)
- ❌ Services → Hooks (services must be pure)

**When Adding Features:**
1. SQL migration in `database/migrations/`
2. CRUD in `src/database/`
3. Business logic in `src/lib/services/`
4. State management in `src/hooks/`
5. UI in `src/pages/`

**Constants Directory (`@/lib/constants`):** Centralized configuration and data via barrel exports:
- Import from `@/lib/constants` (barrel exports all config)
- Game constants for quiz mechanics, scoring, etc.

**MCP Integration:** (Disabled/Postponed)
- MCP tools could not be configured at this stage.
- **Git Operations**: User handles git manually. Terminal git use for updating versionlog.md
- **Database Operations**: User handles Supabase via Dashboard or SQL Editor.

### 🗄️ **Database Setup**

**Development & Production:**
- Supabase project is set up.
- Environment: `.env.local` configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Management: SQL migrations in `database/migrations/` (run via Supabase Dashboard SQL Editor)

**Running Migrations:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents from `database/migrations/001_create_questions_table.sql`
3. Run the script

**Current Schema:**
- `questions` table - Quiz questions with categories, difficulty (0-1), answers, RLS enabled

### 🔐 Row Level Security & Access Controls

**Planned Security:**
- User-scoped data protection via Supabase RLS
- Authentication via Supabase Auth
- Service role for admin operations
- Public access for leaderboards and public data

**Access Patterns:**
- Players can only modify their own data
- Quiz questions are read-only for players
- Leaderboards are publicly readable
- Admin operations require elevated permissions

### 🏗️ Database Schema (Planned)

**Core Tables:**
- `users` - Player profiles and authentication
- `quiz_questions` - Question database with categories and difficulty
- `quiz_sessions` - Active and completed quiz games
- `player_scores` - Individual quiz results
- `leaderboards` - Global and category rankings
- `achievements` - Achievement definitions and player progress
- `player_stats` - Aggregate statistics per player

**Data Flow**: Services → Database → Global Updates → Reactive UI

## 🎮 Core Game Systems & Features

### 1. Quiz System (Planned)
- **Question Management**: Categories, difficulty levels, multiple choice, true/false
- **Quiz Sessions**: Create and join games
- **Scoring**: Points, streak multipliers
- **Real-time Gameplay**: Synchronized questions across players

### 2. Multiplayer (Planned)
- **Lobby System**: Create/join game rooms
- **Matchmaking**: Skill-based player matching
- **Real-time Sync**: Supabase real-time subscriptions
- **Spectator Mode**: Watch ongoing games

### 3. Player Progression (Planned)
- **Experience System**: Level up through gameplay
- **Achievements**: Track various accomplishments
- **Leaderboards**: Global and category-specific rankings
- **Player Stats**: Track player statistics and history

### 4. NPC Opponents (Planned)
- **AI Difficulty Levels**: Easy, Medium, Hard
- **Realistic Behavior**: Variable response and accuracy
- **Training Mode**: Practice without affecting stats

### 5. Social Features (Delayed)
- **Friends System**: Add and challenge friends
- **Chat**: In-game messaging
- **Profile Customization**: Avatars, titles, badges
- **Game History**: Review past matches

### 6. Player Interface (In Progress)
- **Login System**: User authentication and profile creation
- **Navigation**: Main menu, game modes, settings
- **Admin Dashboard**: Question management, user moderation (admin only)
- **Settings**: User preferences and game options
- **Profile**: Stats display and customization
- **Achievements**: Progress tracking and unlocks
- **Leaderboards**: Rankings and competitive stats

---

## 📋 **Project Structure**

See `docs/PROJECT_INFO.md` for detailed project structure and file organization.

---


## 📖 **Documentation**

For detailed information, see:
- **Core Game Mechanics**: `docs/AIDescriptions_coregame.md`
- **Version History**: `docs/versionlog.md`
- **AI Development Rules**: `.cursor/rules/airules.mdc` and `.agent/rules/airulesantigravity.md`
- **Documentation Guide**: `docs/AIpromt_docs.md`

---


**Last Updated**: 2025-12-07
