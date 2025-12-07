# Front Page UI - Initial Design

**Created**: 2025-12-07  
**Status**: Basic MVP for development

## Overview

Simple landing page for the quiz game with modern gradient design and card-based UI.

## Features

### 1. Hero Section
- **Title**: "Bezzerpersuit" 
- **Tagline**: Motivational subheading
- **Design**: Clean, centered layout with gradient background

### 2. Game Mode Cards

#### Solo Practice
- Play against AI opponents
- Multiple difficulty levels  
- Practice mode (no pressure)
- Purple accent button

#### Multiplayer
- Real-time player battles
- Leaderboard climbing
- Achievement system
- Gradient button (purple to pink)

### 3. Quick Stats Display
- Players Online (placeholder: "Coming Soon")
- Total Questions (placeholder: "Coming Soon")
- Games Played (placeholder: "Coming Soon")

### 4. Authentication
- Sign In button
- Sign Up button
- Both using outline variant

## Design Elements

### Color Scheme
- **Background**: Dark gradient (slate-900 → purple-900 → slate-900)
- **Cards**: Semi-transparent slate with backdrop blur
- **Accents**: Purple (#9333ea) and pink (#db2777)
- **Text**: White primary, purple-200 secondary

### Interactive Elements
- **Hover effects**: Scale up (105%) on cards
- **Transitions**: Smooth color and transform transitions
- **Glassmorphism**: Backdrop blur on cards

### Typography
- **Title**: 6xl, bold, white
- **Card titles**: 2xl, white
- **Descriptions**: xl/base, purple-200
- **Stats**: 3xl bold purple-400

## Components Used
- `Button` - ShadCN UI
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - ShadCN UI

## File Structure
```
src/
├── App.tsx          # Main landing page
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── index.ts (barrel exports)
└── index.css        # Tailwind + theme
```

## Next Steps (Future Iterations)

1. **Add functionality**:
   - Wire up button click handlers
   - Add routing to game modes
   - Implement auth flow

2. **Enhance UI**:
   - Add animations (framer-motion)
   - Add icons (lucide-react)
   - Add background patterns/effects
   - Hero image or illustration

3. **Add more sections**:
   - Real leaderboard preview
   - Featured categories
   - How to play guide
   - Recent activity feed

4. **Responsive improvements**:
   - Mobile-specific optimizations
   - Touch interactions
   - Smaller card layouts

5. **Dynamic content**:
   - Fetch real stats from Supabase
   - Display actual player counts
   - Show real question bank size

## Notes
- Design is intentionally simple as requested
- Will be iterated on multiple times
- Follows modern web design principles (gradients, glassmorphism, micro-animations)
- Uses only Tailwind CSS (no custom CSS files)
- All components use barrel exports as per AI rules
