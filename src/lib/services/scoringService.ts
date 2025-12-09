import type { Player, Question } from '@/lib/utils'

/**
 * Scoring Service - Business logic for calculating and distributing points
 */

/**
 * Round a number to a maximum of 10 decimal places to avoid floating point precision issues
 */
function roundToMaxDecimals(value: number, maxDecimals: number = 10): number {
  const multiplier = Math.pow(10, maxDecimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Calculate points for a question based on difficulty
 * Formula: 1 + difficulty
 * Returns exact decimal value (e.g., 0.3 difficulty = 1.3 points, 0.642 difficulty = 1.642 points)
 */
export function calculateQuestionPoints(difficulty: number): number {
  return roundToMaxDecimals(1 + difficulty)
}

/**
 * Calculate point multiplier based on how many other players answered correctly
 * The more players who got it right, the fewer points you get
 * 
 * @param totalOtherPlayers - Number of other players (excluding the player being scored)
 * @param otherPlayersCorrect - Number of other players who answered correctly
 * @returns Multiplier between 0.5 and 1.0
 * 
 * Examples:
 * - 0 out of 3 others correct: 1.0x (full points)
 * - 1 out of 3 others correct: 0.83x
 * - 2 out of 3 others correct: 0.67x
 * - 3 out of 3 others correct: 0.5x (half points)
 */
export function calculatePointMultiplier(
  totalOtherPlayers: number,
  otherPlayersCorrect: number
): number {
  if (totalOtherPlayers === 0) return 1.0

  // Linear interpolation: 1.0 when 0 correct, 0.5 when all correct
  const ratio = otherPlayersCorrect / totalOtherPlayers
  return 1.0 - (ratio * 0.5)
}

/**
 * Calculate points earned by a specific player
 * Core logic for turn-based scoring with multipliers and "I KNOW!" powerup
 * 
 * @param player - The player to calculate points for
 * @param playerIndex - Index of the player in the players array
 * @param players - All players
 * @param turnPlayerIndex - Index of the turn player
 * @param question - The current question
 * @returns Points earned (can be negative if used I KNOW and got it wrong)
 */
function calculatePlayerPoints(
  player: Player,
  playerIndex: number,
  players: Player[],
  turnPlayerIndex: number,
  question: Question
): number {
  const isCorrect = player.selectedAnswer === question.correctAnswerIndex
  const isTurnPlayer = playerIndex === turnPlayerIndex
  const basePoints = calculateQuestionPoints(question.difficulty)
  const turnPlayerCorrect = players[turnPlayerIndex].selectedAnswer === question.correctAnswerIndex
  const usedIKnow = player.usedIKnowThisRound || false

  if (isTurnPlayer) {
    // Turn player gets points if correct (I KNOW not applicable)
    if (!isCorrect) return 0

    const otherPlayersCorrectCount = players.filter(
      (p, i) => i !== playerIndex && p.selectedAnswer === question.correctAnswerIndex
    ).length
    const otherPlayersCount = players.length - 1
    const multiplier = calculatePointMultiplier(otherPlayersCount, otherPlayersCorrectCount)
    return basePoints * multiplier
  } else {
    // Other players - handle I KNOW powerup
    if (usedIKnow) {
      if (!isCorrect) {
        // Player wrong with I KNOW - LOSE double points
        // Penalty applies REGARDLESS of whether turn player was correct
        const otherPlayersCorrectCount = players.filter(
          (p, i) => i !== turnPlayerIndex && i !== playerIndex && p.selectedAnswer === question.correctAnswerIndex
        ).length
        const otherPlayersCount = players.length - 2
        const multiplier = calculatePointMultiplier(otherPlayersCount, otherPlayersCorrectCount)
        return -(basePoints * multiplier) * 2
      } else if (turnPlayerCorrect) {
        // Turn player was correct and current player was correct - no penalty, no bonus
        return 0
      } else {
        // Turn player wrong, player correct with I KNOW - DOUBLE points
        const otherPlayersCorrectCount = players.filter(
          (p, i) => i !== turnPlayerIndex && i !== playerIndex && p.selectedAnswer === question.correctAnswerIndex
        ).length
        const otherPlayersCount = players.length - 2
        const multiplier = calculatePointMultiplier(otherPlayersCount, otherPlayersCorrectCount)
        return (basePoints * multiplier) * 2
      }
    } else {
      // Normal scoring without I KNOW
      if (!isCorrect || turnPlayerCorrect) return 0

      const otherPlayersCorrectCount = players.filter(
        (p, i) => i !== turnPlayerIndex && i !== playerIndex && p.selectedAnswer === question.correctAnswerIndex
      ).length
      const otherPlayersCount = players.length - 2
      const multiplier = calculatePointMultiplier(otherPlayersCount, otherPlayersCorrectCount)
      return basePoints * multiplier
    }
  }
}

/**
 * Update all players' scores after a question is answered
 * Applies turn-based scoring rules with point-stealing mechanic
 * 
 * Rules:
 * - Turn player: Gets points if correct, nothing if wrong
 * - Other players: Can "steal" points if turn player was WRONG AND they were correct
 * - Points are reduced based on how many other players also answered correctly
 * 
 * @param players - All players with their answers
 * @param currentTurnPlayerIndex - Index of the player whose turn it is
 * @param question - The current question
 * @returns Updated players array with new scores added
 */
export function applyScores(
  players: Player[],
  currentTurnPlayerIndex: number,
  question: Question
): Player[] {
  return players.map((player, index) => {
    const earnedPoints = calculatePlayerPoints(player, index, players, currentTurnPlayerIndex, question)

    if (earnedPoints === 0) return player

    return {
      ...player,
      score: roundToMaxDecimals(player.score + earnedPoints)
    }
  })
}

/**
 * Check if a player's answer is correct
 */
export function isAnswerCorrect(answerIndex: number, question: Question): boolean {
  return answerIndex === question.correctAnswerIndex
}

/**
 * Get human players only (excluding AI)
 */
export function getHumanPlayers(players: Player[]): Player[] {
  return players.filter(p => !p.isAI)
}

/**
 * Calculate points earned by a specific player for display purposes
 * Uses the same core logic as scoring but returns the value for UI display
 * 
 * @param player - The player to calculate points for
 * @param playerIndex - Index of the player in the players array
 * @param players - All players
 * @param turnPlayerIndex - Index of the turn player
 * @param question - The current question
 * @returns Points earned (0 if incorrect or didn't earn points)
 */
export function calculatePlayerPointsForDisplay(
  player: Player,
  playerIndex: number,
  players: Player[],
  turnPlayerIndex: number,
  question: Question
): number {
  return calculatePlayerPoints(player, playerIndex, players, turnPlayerIndex, question)
}
