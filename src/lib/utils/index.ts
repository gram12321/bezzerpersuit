/**
 * Barrel export file for all utilities
 * Re-exports everything from individual util files for clean imports
 */

// Re-export game configuration constants
export {
  QUESTIONS_PER_GAME,
  QUESTION_TIME_LIMIT,
  SELECTION_TIME_LIMIT,
  I_KNOW_POWERUPS_PER_PLAYER
} from '../constants/gameOptions'

// Re-export types
export type {
  QuestionCategory,
  QuestionClass,
  GamePhase,
  DifficultyScore,
  Question,
  Player,
  AIPersonality,
  GameOptions,
  LobbyState,
  User,
  PlayerStats,
  GameSession
} from './types'

export {
  QUIZ_CATEGORIES,
  QUESTION_CLASSES,
  createDifficultyScore
} from './types'

// Re-export UI utilities (color, theme, emojis)
export {
  CATEGORY_EMOJIS,
  getCategoryEmoji,
  CATEGORY_THEMES,
  CATEGORY_COLORS,
  getCategoryColorClasses,
  getCategoryTheme,
  getCategoriesByTheme,
  DIFFICULTY_EMOJIS,
  getDifficultyEmoji,
  getShortenedCategoryName
} from './UIUtils'

// Re-export avatar utilities
export {
  AVATAR_OPTIONS,
  getAvatarEmoji,
  getAvatarLabel,
  STATUS_EMOJIS,
  PLAYER_STATE_EMOJIS
} from './avatars'

// Re-export general utilities
export {
  cn,
  getDisplayName,
  formatNumber,
  formatPercent,
  formatTime,
  formatDate,
  getRandomFromArray,
  randomInRange,
  clamp01,
  QUIZ_DIFFICULTY_LEVELS,
  getDifficultyColorClasses,
  type DifficultyLevel
} from './utils'
