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
