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

// Added a couple personality-focused avatars
// - `dice` for unpredictable/wildcard personalities
// - `graduate` for novice/student-like personalities
export const EXTRA_AVATARS = [
  { id: 'dice', emoji: '🎲', label: 'Dice' },
  { id: 'graduate', emoji: '🧑‍🎓', label: 'Graduate' },
] as const

// Merge into AVATAR_OPTIONS for lookup convenience
export const ALL_AVATAR_OPTIONS = [...AVATAR_OPTIONS, ...EXTRA_AVATARS] as const

/**
 * Get avatar emoji by ID
 */
export function getAvatarEmoji(avatarId: string): string {
  const avatar = ALL_AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS.find(a => a.id === avatarId)
  return avatar?.emoji || '👤'
}

/**
 * Get avatar label by ID
 */
export function getAvatarLabel(avatarId: string): string {
  const avatar = ALL_AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS.find(a => a.id === avatarId)
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
