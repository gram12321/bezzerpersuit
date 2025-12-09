/**
 * Color utilities for quiz categories and difficulty levels
 * Handles color theming, category organization, and emoji assignments
 */

/**
 * Category emojis for quiz categories
 */
export const CATEGORY_EMOJIS: Record<string, string> = {
  'Geography': '🌍',
  'Nature and Ecology': '🌿',
  'Natural Sciences': '🔬',
  'Technology and Engineering': '⚙️',
  'Visual Arts and Design': '🎨',
  'Literature and Narrative Arts': '📚',
  'History': '🏛️',
  'Sports, Games, and Entertainment': '🏀',
  'Food and Cooking': '🍳',
  'Music and Performing Arts': '🎵',
  'Business and Economics': '💼',
  'Mythology and Religion': '⚡',
  'Philosophy and Critical Thinking': '💭',
  'Medicine and Health Sciences': '⚕️',
  'Law, Government, and Politics': '⚖️',
  'General Knowledge': '📖'
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || '❓'
}

/**
 * Category themes - Logical groupings of related categories
 * 5 themes with coordinated color palettes
 */
export const CATEGORY_THEMES = {
  // 🌍 WORLD & NATURE - Blues (All blue shades)
  worldAndNature: {
    name: 'World & Nature',
    emoji: '🌍',
    categories: [
      'Geography',
      'Nature and Ecology',
      'Natural Sciences'
    ],
    colors: {
      primary: 'blue',      // Geography
      secondary: 'cyan',    // Nature
      tertiary: 'sky'       // Natural Sciences
    }
  },

  // 🎨 ARTS & CULTURE - Pink & Purple (Creative)
  artsAndCulture: {
    name: 'Arts & Culture',
    emoji: '🎨',
    categories: [
      'Visual Arts and Design',
      'Literature and Narrative Arts',
      'Music and Performing Arts',
      'Mythology and Religion'
    ],
    colors: {
      primary: 'purple',    // Visual Arts
      secondary: 'violet',  // Literature
      tertiary: 'fuchsia',  // Music
      quaternary: 'pink'    // Mythology
    }
  },

  // 🏛️ SOCIETY & HISTORY - Yellows & Oranges (Time & Power)
  societyAndHistory: {
    name: 'Society & History',
    emoji: '🏛️',
    categories: [
      'History',
      'Law, Government, and Politics',
      'Philosophy and Critical Thinking',
      'Business and Economics'
    ],
    colors: {
      primary: 'yellow',    // History
      secondary: 'amber',   // Law & Politics
      tertiary: 'orange',   // Philosophy
      quaternary: 'yellow'  // Business
    }
  },

  // 🎯 LIFESTYLE & SPORTS - Reds (Active & Energetic)
  lifestyleAndSports: {
    name: 'Lifestyle & Sports',
    emoji: '🎯',
    categories: [
      'Sports, Games, and Entertainment',
      'Food and Cooking'
    ],
    colors: {
      primary: 'red',       // Sports
      secondary: 'rose'     // Food
    }
  },

  // 🔬 SCIENCE - Greens (Technical & Medical)
  science: {
    name: 'Science',
    emoji: '🔬',
    categories: [
      'Technology and Engineering',
      'Medicine and Health Sciences',
      'General Knowledge'
    ],
    colors: {
      primary: 'green',     // Technology
      secondary: 'emerald', // Medicine
      tertiary: 'teal'      // General Knowledge
    }
  }
} as const

/**
 * Category color classes for quiz categories
 * Organized by theme for visual grouping
 */
export const CATEGORY_COLORS: Record<string, string> = {
  // 🌍 WORLD & NATURE (All Blues)
  'Geography': 'bg-blue-600 hover:bg-blue-700 text-white',
  'Nature and Ecology': 'bg-cyan-600 hover:bg-cyan-700 text-white',
  'Natural Sciences': 'bg-sky-600 hover:bg-sky-700 text-white',

  // 🎨 ARTS & CULTURE (Purple & Pink)
  'Visual Arts and Design': 'bg-purple-600 hover:bg-purple-700 text-white',
  'Literature and Narrative Arts': 'bg-violet-600 hover:bg-violet-700 text-white',
  'Music and Performing Arts': 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white',
  'Mythology and Religion': 'bg-pink-600 hover:bg-pink-700 text-white',

  // 🏛️ SOCIETY & HISTORY (Yellow & Orange)
  'History': 'bg-yellow-600 hover:bg-yellow-700 text-white',
  'Law, Government, and Politics': 'bg-amber-600 hover:bg-amber-700 text-white',
  'Philosophy and Critical Thinking': 'bg-orange-600 hover:bg-orange-700 text-white',
  'Business and Economics': 'bg-yellow-700 hover:bg-yellow-800 text-white',

  // 🎯 LIFESTYLE & SPORTS (Red)
  'Sports, Games, and Entertainment': 'bg-red-600 hover:bg-red-700 text-white',
  'Food and Cooking': 'bg-rose-600 hover:bg-rose-700 text-white',

  // 🔬 SCIENCE (Green)
  'Technology and Engineering': 'bg-green-600 hover:bg-green-700 text-white',
  'Medicine and Health Sciences': 'bg-emerald-600 hover:bg-emerald-700 text-white',
  'General Knowledge': 'bg-teal-600 hover:bg-teal-700 text-white'
}

/**
 * Get color classes for a category
 */
export function getCategoryColorClasses(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-slate-600 hover:bg-slate-700 text-white'
}

/**
 * Get the theme for a given category
 */
export function getCategoryTheme(category: string): keyof typeof CATEGORY_THEMES | null {
  for (const [themeKey, theme] of Object.entries(CATEGORY_THEMES)) {
    if ((theme.categories as readonly string[]).includes(category)) {
      return themeKey as keyof typeof CATEGORY_THEMES
    }
  }
  return null
}

/**
 * Get all categories organized by theme
 * Returns an array of theme objects with their categories
 */
export function getCategoriesByTheme(): Array<{
  themeKey: keyof typeof CATEGORY_THEMES
  name: string
  emoji: string
  categories: readonly string[]
}> {
  return Object.entries(CATEGORY_THEMES).map(([themeKey, theme]) => ({
    themeKey: themeKey as keyof typeof CATEGORY_THEMES,
    name: theme.name,
    emoji: theme.emoji,
    categories: theme.categories
  }))
}

/**
 * Difficulty emojis matching the 10 quiz difficulty levels
 */
export const DIFFICULTY_EMOJIS = {
  trivial: '🟢',              // 0.0-0.1
  easyPickings: '🟢',         // 0.1-0.2
  comfortZone: '🟩',          // 0.2-0.3
  brainTickler: '💚',         // 0.3-0.4
  requiresFinesse: '🟡',      // 0.4-0.5
  trickyTerritory: '🟠',      // 0.5-0.6
  brainBuster: '🔶',          // 0.6-0.7
  highWireAct: '🔸',          // 0.7-0.8
  phdLevelMadness: '🔴',      // 0.8-0.9
  impossible: '💀'            // 0.9-1.0
} as const

/**
 * Get difficulty emoji based on difficulty value (0-1)
 */
export function getDifficultyEmoji(difficulty: number): string {
  const clamped = Math.max(0, Math.min(1, difficulty))
  
  if (clamped <= 0.1) return DIFFICULTY_EMOJIS.trivial
  if (clamped <= 0.2) return DIFFICULTY_EMOJIS.easyPickings
  if (clamped <= 0.3) return DIFFICULTY_EMOJIS.comfortZone
  if (clamped <= 0.4) return DIFFICULTY_EMOJIS.brainTickler
  if (clamped <= 0.5) return DIFFICULTY_EMOJIS.requiresFinesse
  if (clamped <= 0.6) return DIFFICULTY_EMOJIS.trickyTerritory
  if (clamped <= 0.7) return DIFFICULTY_EMOJIS.brainBuster
  if (clamped <= 0.8) return DIFFICULTY_EMOJIS.highWireAct
  if (clamped <= 0.9) return DIFFICULTY_EMOJIS.phdLevelMadness
  return DIFFICULTY_EMOJIS.impossible
}

/**
 * Shortened category names for compact display
 */
const CATEGORY_SHORT_NAMES: Record<string, string> = {
  'Geography': 'Geography',
  'Nature and Ecology': 'Nature',
  'Natural Sciences': 'Nat. Sciences',
  'Technology and Engineering': 'Technology',
  'Visual Arts and Design': 'Visual Arts',
  'Literature and Narrative Arts': 'Literature',
  'History': 'History',
  'Sports, Games, and Entertainment': 'Sports & Games',
  'Food and Cooking': 'Food',
  'Music and Performing Arts': 'Music',
  'Business and Economics': 'Business',
  'Mythology and Religion': 'Mythology',
  'Philosophy and Critical Thinking': 'Philosophy',
  'Medicine and Health Sciences': 'Medicine',
  'Law, Government, and Politics': 'Law & Politics',
  'General Knowledge': 'Gen. Knowledge'
}

/**
 * Get shortened category name for compact display
 */
export function getShortenedCategoryName(category: string): string {
  return CATEGORY_SHORT_NAMES[category] || category
}
