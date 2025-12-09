# AI Personality System Design

## Overview
This document outlines the AI opponent personality system for Bezzerpersuit. NPCs will have distinct personalities that affect their gameplay behavior, making them feel like real opponents with recognizable patterns.

## Core Design Philosophy
- **Static Personalities**: Each NPC has fixed traits (not randomly generated each game)

---

## Phase 1: Core Implementation (Current)

### 1. Skill Level
Each AI has a base competence level and category preferences:

**Parameters:**
- `baseSuccessRate` (0.0 - 1.0): Overall probability of answering correctly
- `categoryModifiers`: Object mapping categories to bonus/penalty values
  - Example: `{ science: 0.15, sports: -0.10 }`


**Example:**
- Professor with 0.75 base rate + 0.15 science bonus = 0.90 success on science questions
- Same professor with -0.10 sports penalty = 0.65 success on sports questions

### 2. Consistency
How predictable/variable the AI's performance is:

**Parameter:**
- `consistency` (0.0 - 1.0): Performance variance
  - 0.0 = Perfectly consistent (like a robot)
  - 0.5 = Moderate variation (realistic human)
  - 1.0 = Wildly unpredictable (can ace or bomb any question)

**Implementation:**
Adds randomness to success calculation. Higher consistency = tighter performance band around their base rate.

### 3. Category & Difficulty Selection
AI makes strategic choices about which category AND difficulty to pick together:

**Core Logic:**
AI pairs their strengths with difficulty levels to maximize points:
- **High Difficulty (0.6-0.9)**: Use strongest categories where they'll succeed
- **Medium Difficulty (0.4-0.6)**: Use average/neutral categories
- **Low Difficulty (0.1-0.3)**: Use weakest categories (game will force this anyway)

**Implementation:**
1. When selecting category: AI ranks available categories by modifier strength
2. When selecting difficulty: AI checks what difficulties are available (game forces variety)
3. Pair them strategically: high difficulty with strong category, low difficulty with weak category

**Example:**
- Professor with science +0.15 (strong) and sports -0.15 (weak):
  - If high difficulty available: Pick science
  - If low difficulty available: Pick sports
  - If medium difficulty: Pick science or history (neutral)

**Fallback (when forced):**
If AI can't pick optimal pairing (all difficulties available in same category), they still make the best choice with available options.

**Future Enhancement:** Counter-opponent selection (picks categories opponent is weak in) once player skill tracking is implemented.

### 5. Boost Usage ("I Know!" Mechanic)
**Current Game Mechanic:**
- Used BEFORE seeing turn player's answer
- Only pays off if turn player answers incorrectly
- Strategic usage: Use when you're strong in category OR question is difficult for opponent

**Phase 1 Implementation (Basic):**
- `boostUsageRate` (0.0 - 1.0): Probability of using boost
- **Simple logic**: AI uses boost when it's their strongest category AND they haven't used it yet
- AI tracks boost availability per game

**Complexity Note:**
This mechanic requires opponent modeling (estimating opponent strength in categories) and risk assessment (difficulty vs opponent skill). This is VERY complex for AI logic. We're implementing basic usage now and will enhance later as we refine the boost mechanic itself.

**Future Enhancement Ideas (not implemented yet):**
- Calculate expected value: `(opponentFailChance × boostReward) - cost`
- Use more frequently when losing
- Never use when far ahead
- Model opponent category strengths over time

---

## Phase 2: Future Enhancements

### Adaptive Difficulty
**Requires:** Player skill rating system (ELO/MMR)

AI adjusts their performance to match player skill level for better gameplay experience.

**Parameters:**
- `adaptToOpponent`: Enable/disable adaptation
- `adaptationSpeed`: How quickly AI learns (0.1 = slow, 0.5 = fast)

**Mechanism:**
Track player's actual success rate and gradually adjust AI baseSuccessRate to stay competitive (e.g., AI aims for 10% better than player).

### Response Timing
Add human-like delay before AI answers to make multiplayer feel more realistic.

**Parameters:**
- `responseDelay`: { min: 1000, max: 3000 } milliseconds
- Smarter AIs might respond faster (or slower if "overthinking")

### Momentum System
Performance changes based on win/loss streaks.

**Parameters:**
- `momentum`: Modifier applied during streaks

### Pressure/Clutch Factor
Performance changes in close games.

**Parameters:**
- `pressure`: Modifier when scores are close
- Negative = chokes under pressure
- Positive = clutch player (performs better)

### Learning & Memory
**Advanced feature:**
- AI remembers questions and doesn't make same mistake twice (Could use excisting spoiler system modifyed for AIs)
- AI improves in categories they've answered more questions in (But we would likely have to track AI foreach player. IE AI starts from 0 for each player)
- Creates sense of AI "learning" over multiple games

---

## Example AI Personalities

### The Novice
*Perfect for beginners*
```
baseSuccessRate: 0.35
categoryModifiers: { /* balanced across categories */ }
consistency: 0.6 (somewhat unpredictable)
boostUsageRate: 0.0 (never uses boost)
```

### The Professor
*Academic expert*
```
baseSuccessRate: 0.80
categoryModifiers: { science: 0.15, history: 0.12, sports: -0.15 }
consistency: 0.1 (very consistent)
boostUsageRate: 0.7 (uses in strong categories)
```

### The Sports Fanatic
*One-track mind*
```
baseSuccessRate: 0.60
categoryModifiers: { sports: 0.25, entertainment: 0.10, science: -0.20 }
consistency: 0.3 (fairly consistent)
boostUsageRate: 0.8 (aggressive, especially sports)
```

### The Jack-of-All-Trades
*Balanced competitor*
```
baseSuccessRate: 0.65
categoryModifiers: { history: 0.08, arts: 0.08, geography: 0.08 }
consistency: 0.2 (consistent)
boostUsageRate: 0.5 (measured usage)
```

### The Wildcard
*Unpredictable chaos*
```
baseSuccessRate: 0.50
categoryModifiers: { /* moderate across all */ }
consistency: 0.9 (extremely unpredictable)
boostUsageRate: 0.6 (uses randomly)
```

---

## Implementation Notes

### Data Structure
```typescript
interface AIPersonality {
  // Identity
  id: string
  name: string
  avatar: string
  description: string
  
  // Phase 1: Core traits
  baseSuccessRate: number
  categoryModifiers: Partial<Record<QuestionCategory, number>>
  consistency: number
  boostUsageRate: number
  // Category/difficulty selection is automatic (strategic pairing, no personality variance)
  
  // Phase 2: Future (optional)
  adaptToOpponent?: boolean
  adaptationSpeed?: number
  responseDelay?: { min: number; max: number }
  momentum?: number
  pressure?: number
}
```

### Integration Points
- `aiLogic.ts`: Core answer generation with personality modifiers
- `gameService.ts`: Strategic category/difficulty pairing for AI selections
- AI personality definitions: New constants file (e.g., `aiPersonalities.ts`)
- Player type: Extend to include `aiPersonality?: AIPersonality`

### Category/Difficulty Pairing Algorithm
When AI picks a turn:
1. Rank available categories by categoryModifier strength (highest to lowest)
2. Rank available difficulties (highest to lowest)
3. Sort into tiers: Strong, Neutral, Weak categories
4. Pair strategically:
   - High difficulty → Strong category (maximize points)
   - Medium difficulty → Neutral category
   - Low difficulty → Weak category (forced variety)
5. Apply consistency variance to reduce predictability

---

## Future Considerations

### Player Visibility
Should players see AI traits explicitly or discover them through gameplay?
- **Option C**: Partial reveal (show general description, hide exact numbers)

### NPC Progression
- All NPCs available from start? yes
