# Bezzerpersuit - Project Information

## 📁 Project File Structure

```
bezzerpersuit/
├── database/
│   ├── migrations/           # SQL migrations (run in Supabase)
│   └── README.md            # Database setup guide
├── docs/                    # Documentation
│   ├── AIDescriptions_coregame.md
│   ├── PROJECT_INFO.md
│   └── versionlog.md
├── src/
│   ├── database/            # Data Access Layer (CRUD only)
│   │   ├── questionsRepository.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── services/        # Business Logic Layer
│   │   │   ├── questionService.ts
│   │   │   ├── gameService.ts
│   │   │   └── index.ts
│   │   ├── constants/       # Configuration
│   │   │   └── index.ts
│   │   ├── types.ts         # Global types
│   │   ├── utils.ts         # Utility functions
│   │   └── supabase.ts      # Supabase client
│   ├── hooks/               # React Hooks (State Management)
│   │   ├── useGameState.ts
│   │   └── index.ts
│   ├── pages/               # Page Components (UI only)
│   │   ├── GameArea.tsx
│   │   └── index.ts
│   ├── components/
│   │   └── ui/              # ShadCN UI components
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
└── .env.local               # Supabase credentials
```

## 🏗️ Architecture Layers

**Strict Separation of Concerns:**

1. **Database Layer** (`src/database/`) - Pure CRUD operations
2. **Services Layer** (`src/lib/services/`) - Business logic
3. **Hooks Layer** (`src/hooks/`) - React state management  
4. **Pages Layer** (`src/pages/`) - UI presentation only

**Data Flow:** User → Pages → Hooks → Services → Database → Supabase

## 📊 Code Statistics

### Line Count Summary (src/ directory only)
- **Total Files**: To be determined
- **Total Lines of Code**: Fresh start

### Breakdown by File Type
- **TypeScript Files** (.ts, .tsx): TBD
- **CSS Files** (.css): TBD

---

**Last Updated**: 2025-12-07
**Project Phase**: Initial Setup
