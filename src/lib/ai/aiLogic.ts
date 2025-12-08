import type { Question, Player, QuestionCategory, DifficultyScore } from '@/lib/utils/types'
import { QUIZ_CATEGORIES } from '@/lib/utils/types'

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
 * AI selects a random category
 */
export function selectAICategory(): QuestionCategory {
  return QUIZ_CATEGORIES[Math.floor(Math.random() * QUIZ_CATEGORIES.length)]
}

/**
 * AI selects a difficulty in the medium range (0.3 to 0.7)
 */
export function selectAIDifficulty(): DifficultyScore {
  return (0.3 + Math.random() * 0.4) as DifficultyScore
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
