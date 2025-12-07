import type { Question, Player } from '@/lib/utils/types'

/**
 * AI Logic - Handles AI player behavior and decision making
 */

/**
 * Generate AI answer for a question
 * Currently uses random selection
 */
export function generateAIAnswer(question: Question): number {
  return Math.floor(Math.random() * question.answers.length)
}

/**
 * Process AI answers for all AI players in a game
 * @param players - All players in the game
 * @param currentPlayerId - ID of the current human player
 * @param question - Current question
 * @returns Updated players array with AI scores updated
 */
export function processAIAnswers(
  players: Player[],
  currentPlayerId: string,
  question: Question
): Player[] {
  return players.map(p => {
    if (p.isAI && p.id !== currentPlayerId) {
      const aiAnswer = generateAIAnswer(question)
      const aiCorrect = aiAnswer === question.correctAnswerIndex
      const aiPoints = aiCorrect ? 1 : 0
      return { ...p, score: p.score + aiPoints }
    }
    return p
  })
}
