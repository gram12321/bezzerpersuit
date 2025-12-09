import type { AIPersonality } from '@/lib/utils'

export const PROFESSOR: AIPersonality = {
  id: 'professor',
  name: 'The Professor',
  avatar: '🧑‍🏫',
  description: 'Academic expert, excels in science and history.',
  baseSuccessRate: 0.80,
  categoryModifiers: {
    'Natural Sciences': 0.15,
    'History': 0.12,
    'Sports, Games, and Entertainment': -0.15
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
  categoryModifiers: {},
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
    'Sports, Games, and Entertainment': 0.25,
    'Natural Sciences': -0.20
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
    'History': 0.08,
    'Visual Arts and Design': 0.08,
    'Geography': 0.08
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
  categoryModifiers: {},
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
