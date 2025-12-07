# Bezzerpersuit - AI Coding Agent Instructions

## Project Overview
Multiplayer quiz game with real-time gameplay and NPC opponents for solo practice. Built with React + TypeScript + Vite + Supabase. Currently in early development phase (v0.0.003).

## Critical Development Rules

### Before Starting Work
- **Read first**: Check `readme.md` and `.cursor/rules/airules.mdc` for comprehensive project context
- **AI Check-Message**: Start responses with confidence assessment (1-5 scale) on understanding and solving the request
- **NO backwards compatibility**: Dev phase - database resets are acceptable, no migrations needed

### Code Generation Principles
- **Named imports only**: No default exports
- **ES imports**: Use `import`, never `require`
- **Barrel exports**: ALWAYS use `@/components/ui`, `@/lib/services`, `@/lib/utils`, `@/lib/constants` for imports
- **Service layer**: Business logic in `src/lib/services/`, NOT in components
- **Custom hooks**: State management via hooks (e.g., `useLoadingState()`, `useGameState()`)
- **Shared interfaces**: Use `PageProps`, `NavigationProps`, `PlayerProps` from `@/components/UItypes`

### Tech Stack & Styling
- **React**: TypeScript + Vite with path alias `@/` → `./src/`
- **Styling**: Tailwind CSS + ShadCN UI exclusively (NO Bootstrap, NO custom CSS)
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Authentication**: Supabase Auth (built-in)

## Architecture Patterns

### Data Flow
**Services → Database → Global Updates → Reactive UI**
- Components NEVER contain business logic or calculations
- Services trigger global updates via Supabase real-time subscriptions
- Components auto-refresh on data changes

### Directory Structure
```
src/
├── components/
│   └── ui/            # ShadCN components (barrel exports via index.ts)
├── lib/
│   ├── services/      # Business logic organized by domain (user/, quiz/, core/)
│   ├── constants/     # Centralized config (barrel exports)
│   ├── utils.ts       # cn() helper for Tailwind class merging
│   └── supabase.ts    # Supabase client singleton
├── hooks/             # Custom React hooks (planned)
├── pages/             # Page components (planned)
└── database/          # Database layer (empty - future use)
```

### Import Patterns
```typescript
// ✅ Correct
import { Button, Card } from "@/components/ui"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// ❌ Wrong
import Button from "@/components/ui/button"  // No default exports
import { Button } from "./components/ui/button"  // Use @ alias
```

## Development Workflow

### Commands
- **Dev server**: `npm run dev` (DON'T run unless asked - user has it running)
- **Build**: `npm run build` (DON'T run unless asked)
- **Lint**: `npm run lint`

### Version Control
- **Git**: User handles commits manually - NEVER use git commands
- **Version log**: Update `docs/versionlog.md` after major changes with specific file changes and line counts

### Database Management
- **Schema changes**: User handles via Supabase Dashboard/SQL Editor
- **Environment**: Variables in `.env.local` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

## Component Guidelines

### ShadCN UI Components
- Located in `src/components/ui/`
- Exported via barrel file (`index.ts`)
- Use Tailwind's design system with CSS variables (see `tailwind.config.js`)
- Custom styling via `cn()` utility from `@/lib/utils`

### Responsive Design
- **Desktop-first** approach (mobile support planned)
- Use Tailwind breakpoints: `lg:block`, `lg:hidden`
- Pattern: Separate desktop/mobile components when needed

### Example Component Pattern
```tsx
import { Button, Card, CardHeader } from "@/components/ui"
import { cn } from "@/lib/utils"

export function MyComponent() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <Button className={cn("w-full", "bg-purple-600")}>
          Action
        </Button>
      </CardHeader>
    </Card>
  )
}
```

## Project Status & Roadmap

### Implemented (v0.0.003)
- ✅ React + TypeScript + Vite project structure
- ✅ ShadCN UI components (Button, Card)
- ✅ Supabase client configuration
- ✅ Tailwind CSS with design system
- ✅ Landing page UI (`App.tsx`)

### Planned Features
- Quiz management system (questions, sessions, scoring)
- Multiplayer lobby and real-time gameplay
- Leaderboards and achievements
- NPC opponents with category specializations
- Social features (friends, chat, profiles)

## Key Files Reference
- **Entry point**: `src/main.tsx` → `src/App.tsx`
- **Supabase client**: `src/lib/supabase.ts`
- **UI utilities**: `src/lib/utils.ts` (cn helper)
- **Component exports**: `src/components/ui/index.ts`
- **Config**: `vite.config.ts` (@ alias), `tailwind.config.js` (theme)
- **Documentation**: `readme.md`, `docs/PROJECT_INFO.md`, `docs/AIDescriptions_coregame.md`

## Common Patterns

### Tailwind Theme Colors
Uses CSS variables from `index.css` - reference `tailwind.config.js` for available colors:
- Primary palette: `slate-`, `purple-`, `pink-`
- Design tokens: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`

### Service Layer Pattern (Future)
```typescript
// src/lib/services/quiz/quizService.ts
export class QuizService {
  async createQuiz() {
    // Business logic here
    // Trigger Supabase update
    // Components auto-refresh
  }
}
```

## What NOT to Do
- ❌ Use `npm run dev` or `npm run build` without being asked
- ❌ Run git commands (user handles version control)
- ❌ Put business logic in React components
- ❌ Use custom CSS or Bootstrap
- ❌ Use default exports
- ❌ Create database migrations (no backwards compatibility needed)
- ❌ Import without `@/` alias
- ❌ Call Supabase directly from components (use service layer)
