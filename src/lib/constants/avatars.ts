/**
 * Avatar options and emoji constants for user profiles and UI elements
 * Inspired by icon system from previous project iterations
 */

/**
 * Available avatar options for user profiles
 */
export const AVATAR_OPTIONS = [
  { id: 'default', emoji: '👤', label: 'Default' },
  { id: 'gamer', emoji: '🎮', label: 'Gamer' },
  { id: 'brain', emoji: '🧠', label: 'Brain' },
  { id: 'wizard', emoji: '🧙', label: 'Wizard' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja' },
  { id: 'superhero', emoji: '🦸', label: 'Superhero' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'alien', emoji: '👽', label: 'Alien' },
  { id: 'detective', emoji: '🕵️', label: 'Detective' },
  { id: 'scientist', emoji: '👨‍🔬', label: 'Scientist' },
  { id: 'teacher', emoji: '👨‍🏫', label: 'Teacher' },
  { id: 'artist', emoji: '👨‍🎨', label: 'Artist' },
  { id: 'musician', emoji: '👨‍🎤', label: 'Musician' },
  { id: 'athlete', emoji: '🏃', label: 'Athlete' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'lightning', emoji: '⚡', label: 'Lightning' },
  { id: 'trophy', emoji: '🏆', label: 'Trophy' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' }
] as const

/**
 * Get avatar emoji by ID
 */
export function getAvatarEmoji(avatarId: string): string {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId)
  return avatar?.emoji || '👤'
}

/**
 * Get avatar label by ID
 */
export function getAvatarLabel(avatarId: string): string {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId)
  return avatar?.label || 'Default'
}

/**
 * Status emojis for game UI elements
 */
export const STATUS_EMOJIS = {
  time: '⏱️',
  timer: '⏰',
  clock: '🕐',
  score: '🎯',
  points: '💯',
  correct: '✅',
  incorrect: '❌',
  lightning: '⚡',
  fire: '🔥',
  star: '⭐',
  trophy: '🏆',
  medal: '🥇',
  brain: '🧠',
  thinking: '🤔',
  celebrate: '🎉',
  confetti: '🎊'
} as const

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
 * Category color classes for quiz categories
 * Each category gets distinctive colors for background and text
 */
export const CATEGORY_COLORS: Record<string, string> = {
  'Geography': 'bg-blue-600 hover:bg-blue-700 text-white',
  'Nature and Ecology': 'bg-green-600 hover:bg-green-700 text-white',
  'Natural Sciences': 'bg-cyan-600 hover:bg-cyan-700 text-white',
  'Technology and Engineering': 'bg-slate-600 hover:bg-slate-700 text-white',
  'Visual Arts and Design': 'bg-pink-600 hover:bg-pink-700 text-white',
  'Literature and Narrative Arts': 'bg-amber-600 hover:bg-amber-700 text-white',
  'History': 'bg-yellow-700 hover:bg-yellow-800 text-white',
  'Sports, Games, and Entertainment': 'bg-orange-600 hover:bg-orange-700 text-white',
  'Food and Cooking': 'bg-red-600 hover:bg-red-700 text-white',
  'Music and Performing Arts': 'bg-purple-600 hover:bg-purple-700 text-white',
  'Business and Economics': 'bg-indigo-600 hover:bg-indigo-700 text-white',
  'Mythology and Religion': 'bg-violet-600 hover:bg-violet-700 text-white',
  'Philosophy and Critical Thinking': 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white',
  'Medicine and Health Sciences': 'bg-teal-600 hover:bg-teal-700 text-white',
  'Law, Government, and Politics': 'bg-rose-700 hover:bg-rose-800 text-white',
  'General Knowledge': 'bg-emerald-600 hover:bg-emerald-700 text-white'
}

/**
 * Get color classes for a category
 */
export function getCategoryColorClasses(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-slate-600 hover:bg-slate-700 text-white'
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
 * Player state emojis
 */
export const PLAYER_STATE_EMOJIS = {
  ready: '✅',
  notReady: '⏳',
  thinking: '🤔',
  answered: '✓',
  correct: '🎉',
  incorrect: '😔',
  host: '👑',
  ai: '🤖'
} as const
