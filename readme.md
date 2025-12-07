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
- **NO BACKWARDS COMPATIBILITY**: We are in dev phase. Database will be reset if compatibility issues arise - no migrations needed
- **ALWAYS use barrel exports**: `@/components/ui`, `@/hooks`, `@/lib/services`, `@/lib/utils`, `@/lib/constants`
- **ALWAYS use custom hooks**: For state management and data loading
- **ALWAYS use shared interfaces**: Consistent TypeScript interfaces across the app
- **ALWAYS use service exports**: Game state management through services
- **Business logic in services**: Never put calculations in components
- **Reactive updates**: Services trigger global updates, components auto-refresh

**Constants Directory (`@/lib/constants`):** Centralized configuration and data via barrel exports:
- Import from `@/lib/constants` (barrel exports all config)
- Game constants for quiz mechanics, scoring, etc.

**MCP Integration:** (Setup in progress)
- Git operations via MCP GitHub tools
- Supabase database management via MCP Supabase tools
- Configuration in `.cursor/mcp.json`

### 🗄️ **Database Setup**

**Development Database:**
- Supabase project: TBD
- Environment: `.env.local` (gitignored)
- Management: MCP tools (`mcp_supabase-dev_*`) for agentic operations
- Usage: `localhost` with frequent resets during development

**Production Database:**
- Supabase project: TBD
- Environment: Vercel Dashboard → Environment Variables
- Management: SQL migrations via `migrations/`
- Usage: Deployed on Vercel

**Migration Process:**
1. Update dev database via MCP tools
2. Export schema changes to migration files
3. Apply migrations to production database
4. Verify deployment works

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
- **Scoring**: Points, time bonuses, streak multipliers
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
- **Player Stats**: Performance metrics and history

### 4. NPC Opponents (Planned)
- **AI Difficulty Levels**: Easy, Medium, Hard
- **Realistic Behavior**: Variable response timing and accuracy
- **Training Mode**: Practice without affecting stats
- **Adaptive Challenge**: AI adjusts to player performance

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

```
bezzerpersuit/
├── .agent/
│   └── rules/
│       └── airulesantigravity.md
├── .cursor/
│   └── rules/
│       └── airules.mdc
├── docs/
│   ├── AIDescriptions_coregame.md
│   ├── AIpromt_codecleaning.md
│   ├── AIpromt_docs.md
│   ├── AIpromt_newpromt.md
│   ├── PROJECT_INFO.md
│   └── versionlog.md
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── pages/
│   │   └── ui/
│   ├── database/
│   ├── hooks/
│   ├── lib/
│   │   ├── constants/
│   │   ├── services/
│   │   │   ├── core/
│   │   │   ├── quiz/
│   │   │   └── user/
│   │   ├── types/
│   │   └── utils/
│   └── pages/
├── .env.local (gitignored)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account (for database)
- Vercel account (for deployment)

### Installation (To be completed)
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Start development server
npm run dev
```

### Tech Stack Setup Checklist
- [x] Initialize Vite + React + TypeScript project
- [x] Install and configure Tailwind CSS
- [x] Install and configure ShadCN UI
- [ ] Set up Supabase client
- [ ] Configure MCP tools for Git
- [ ] Configure MCP tools for Supabase
- [ ] Set up basic project structure
- [ ] Create initial database schema
- [ ] Implement authentication flow

---

## 📖 **Documentation**

For detailed information, see:
- **Core Game Mechanics**: `docs/AIDescriptions_coregame.md`
- **Version History**: `docs/versionlog.md`
- **AI Development Rules**: `.cursor/rules/airules.mdc` and `.agent/rules/airulesantigravity.md`
- **Documentation Guide**: `docs/AIpromt_docs.md`

---


**Last Updated**: 2025-12-07
