import type { Question, Player, QuestionCategory, DifficultyScore } from '@/lib/utils/types'
import { QUIZ_CATEGORIES, createDifficultyScore } from '@/lib/utils/types'
import { getAvailableCategories, getAvailableDifficulties } from '@/lib/services/gameService'

/**
 * AI Logic - Handles AI player behavior and decision making
 */

/**
 * Generate AI answer for a question based on difficulty
 * Higher difficulty = lower chance of correct answer
 */
export function generateAIAnswer(question: Question): number {
  const correctChance = 1 - question.difficulty
  const willAnswerCorrectly = Math.random() < correctChance
  
  if (willAnswerCorrectly) {
    return question.correctAnswerIndex
  }
  
  // Pick a random wrong answer
  const wrongAnswers = question.answers
    .map((_, index) => index)
    .filter(index => index !== question.correctAnswerIndex)
  
  return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]
}

/**
 * AI selects a random category from available (unused) categories
 * Falls back to any category if all have been used (shouldn't happen due to reset logic)
 */
export function selectAICategory(usedCategories: QuestionCategory[] = []): QuestionCategory {
  const availableCategories = getAvailableCategories(usedCategories)
  
  // If no available categories, fallback to any category (reset should prevent this)
  const categoriesToChooseFrom = availableCategories.length > 0 ? availableCategories : QUIZ_CATEGORIES
  
  return categoriesToChooseFrom[Math.floor(Math.random() * categoriesToChooseFrom.length)]
}

/**
 * AI selects a difficulty from available (unused) difficulties
 * Prefers medium range (0.3 to 0.7) but will use any available difficulty
 * Falls back to random if all have been used (shouldn't happen due to reset logic)
 */
export function selectAIDifficulty(usedDifficulties: DifficultyScore[] = []): DifficultyScore {
  const availableDifficulties = getAvailableDifficulties(usedDifficulties)
  
  // If no available difficulties, fallback to random (reset should prevent this)
  if (availableDifficulties.length === 0) {
    return createDifficultyScore(0.3 + Math.random() * 0.4)
  }
  
  // Prefer medium difficulties if available
  const mediumDifficulties = availableDifficulties.filter(d => d >= 0.3 && d <= 0.7)
  const difficultiestoChooseFrom = mediumDifficulties.length > 0 ? mediumDifficulties : availableDifficulties
  
  return difficultiestoChooseFrom[Math.floor(Math.random() * difficultiestoChooseFrom.length)]
}

/**
 * Generate AI answers for all AI players
 * Sets hasAnswered and selectedAnswer for each AI
 * 
 * @param players - All players in the game
 * @param question - Current question
 * @returns Updated players array with AI answers
 */
export function generateAIAnswers(
  players: Player[],
  question: Question
): Player[] {
  return players.map(player => {
    if (player.isAI && !player.hasAnswered) {
      const aiAnswer = generateAIAnswer(question)
      return {
        ...player,
        hasAnswered: true,
        selectedAnswer: aiAnswer
      }
    }
    return player
  })
}
