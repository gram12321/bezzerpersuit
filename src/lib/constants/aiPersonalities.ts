import type { AIPersonality } from '@/lib/utils'

export const PROFESSOR: AIPersonality = {
  id: 'professor',
  name: 'The Professor',
  avatar: '🧑‍🏫',
  description: 'Academic expert, excels in science and history.',
  baseSuccessRate: 0.80,
  categoryModifiers: {
    'Natural Sciences': 0.20, // strong
    'History': 0.18, // strong
    'Medicine and Health Sciences': 0.12, // strong
    'Philosophy and Critical Thinking': 0.10, // moderate
    'Technology and Engineering': 0.08, // slight
    'Literature and Narrative Arts': 0.06, // slight
    'Sports, Games, and Entertainment': -0.18, // weak
    'Music and Performing Arts': -0.13, // weak
    'Food and Cooking': -0.10, // weak
    'Business and Economics': -0.07 // slight weak
  },
  consistency: 0.9,
  boostUsageRate: 0.7
}

export const NOVICE: AIPersonality = {
  id: 'novice',
  name: 'The Novice',
  avatar: '🧑‍🎓',
  description: 'Beginner, no particular strengths.',
  baseSuccessRate: 0.35,
  categoryModifiers: {
    // No strong/weak, but slight randomization for diversity
    'General Knowledge': 0.03,
    'Geography': -0.02,
    'Visual Arts and Design': 0.01,
    'Law, Government, and Politics': -0.01
  },
  consistency: 0.5,
  boostUsageRate: 0.0
}

export const SPORTS_FANATIC: AIPersonality = {
  id: 'sports_fanatic',
  name: 'Sports Fanatic',
  avatar: '🏅',
  description: 'Excels in sports, struggles in science.',
  baseSuccessRate: 0.60,
  categoryModifiers: {
    'Sports, Games, and Entertainment': 0.24, // strong
    'Music and Performing Arts': 0.16, // strong
    'Food and Cooking': 0.10, // moderate
    'Business and Economics': 0.08, // slight
    'Geography': 0.06, // slight
    'Natural Sciences': -0.21, // weak
    'Literature and Narrative Arts': -0.15, // weak
    'Philosophy and Critical Thinking': -0.10, // weak
    'History': -0.07 // slight weak
  },
  consistency: 0.6,
  boostUsageRate: 0.8
}

export const JACK_OF_ALL_TRADES: AIPersonality = {
  id: 'jack_of_all_trades',
  name: 'Jack-of-All-Trades',
  avatar: '🧑‍🔬',
  description: 'Balanced competitor, slight bonuses in many categories.',
  baseSuccessRate: 0.65,
  categoryModifiers: {
    'History': 0.08, // slight
    'Visual Arts and Design': 0.08, // slight
    'Geography': 0.08, // slight
    'General Knowledge': 0.07, // slight
    'Technology and Engineering': 0.06, // slight
    'Medicine and Health Sciences': -0.06, // slight weak
    'Law, Government, and Politics': -0.07, // slight weak
    'Mythology and Religion': -0.05 // slight weak
  },
  consistency: 0.7,
  boostUsageRate: 0.5
}

export const WILDCARD: AIPersonality = {
  id: 'wildcard',
  name: 'The Wildcard',
  avatar: '🎲',
  description: 'Unpredictable, moderate skill in all categories.',
  baseSuccessRate: 0.50,
  categoryModifiers: {
    'Sports, Games, and Entertainment': 0.13, // strong
    'Music and Performing Arts': 0.10, // moderate
    'Nature and Ecology': 0.08, // slight
    'Business and Economics': -0.12, // weak
    'Law, Government, and Politics': -0.10, // weak
    'Natural Sciences': -0.07 // slight weak
  },
  consistency: 0.1,
  boostUsageRate: 0.6
}

export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  professor: PROFESSOR,
  novice: NOVICE,
  sports_fanatic: SPORTS_FANATIC,
  jack_of_all_trades: JACK_OF_ALL_TRADES,
  wildcard: WILDCARD
}
