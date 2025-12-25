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
 * Collection icons for question packs (using Icons8 Fluency for a premium icon look)
 */
export const COLLECTION_ICONS: Record<string, string> = {
  'BaseEastern': 'fluency/96/mosque',
  'BaseFarEast': 'fluency/96/pagoda',
  'BaseGlobal': '3d-fluency/94/globe',
  'BaseLatin': 'fluency/96/flamingo',
  'BaseMiddleEast': 'fluency/96/kaaba',
  'BaseWestern': 'fluency/96/museum',
  'Basegame': 'fluency/96/controller',
  'China': 'fluency/96/china-circular',
  'Denmark National': 'fluency/96/denmark-circular',
  'Europe': 'fluency/96/castle',
  'European Union': 'fluency/96/european-union-circular-flag',
  'Germany National': 'fluency/96/germany-circular',
  'Renaissance': 'fluency/96/paint-palette',
  'Silk Road': 'fluency/96/cloth',
  'The Impossible': 'fluency/96/skull',
  'UK National': 'fluency/96/great-britain-circular',
  'Default': 'fluency/96/box'
}

/**
 * Get collection icon URL
 */
export function getCollectionImageUrl(collection: string): string {
  const match = Object.keys(COLLECTION_ICONS).find(
    key => key.toLowerCase() === collection.toLowerCase() ||
      collection.toLowerCase().includes(key.toLowerCase())
  )
  const iconPath = match ? COLLECTION_ICONS[match] : COLLECTION_ICONS.Default
  return `https://img.icons8.com/${iconPath}.png`
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

/**
 * Collection background images mapping.
 * Returns a URL for a collection name or a sensible default image.
 */
const QUESTION_CLASS_BACKGROUNDS: Record<string, string> = {
  'Global': 'https://images.unsplash.com/photo-1506976785307-8732e854ad5b?auto=format&fit=crop&w=1400&q=80',
  'Western': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
  'Far East': 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1400&q=80',
  'Eastern': 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1400&q=80',
  'Latin': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
  'Africa': 'https://images.unsplash.com/photo-1507925921958-8a62f3b5b7d8?auto=format&fit=crop&w=1400&q=80',
  'Middle East': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  'United States': 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1400&q=80',
  'United Kingdom': 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1400&q=80',
  'Denmark': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=80',
  'Germany': 'https://images.unsplash.com/photo-1505765054072-7a0a8f2d4b15?auto=format&fit=crop&w=1400&q=80'
}

export function getQuestionClassBackgroundUrl(questionClass?: string | string[]): string {
  let qc: string | undefined
  if (!questionClass) return QUESTION_CLASS_BACKGROUNDS['Global']
  if (Array.isArray(questionClass)) qc = questionClass[0]
  else qc = questionClass

  if (!qc) return QUESTION_CLASS_BACKGROUNDS['Global']

  // Exact match
  if (QUESTION_CLASS_BACKGROUNDS[qc]) return QUESTION_CLASS_BACKGROUNDS[qc]

  const lower = qc.toLowerCase()
  for (const key of Object.keys(QUESTION_CLASS_BACKGROUNDS)) {
    if (key.toLowerCase() === lower) return QUESTION_CLASS_BACKGROUNDS[key]
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) return QUESTION_CLASS_BACKGROUNDS[key]
  }

  return QUESTION_CLASS_BACKGROUNDS['Global']
}
