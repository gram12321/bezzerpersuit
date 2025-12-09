const RECENT_HISTORY_SIZE = 10
const MAX_CONFIDENCE_SAMPLES = 1000

export interface QuestionStats {
  correct_count: number
  incorrect_count: number
  recent_history: boolean[] // true = correct, false = incorrect
}

export interface DifficultyUpdate {
  newDifficulty: number
  confidence: number
  adjustment: number
}

/**
 * Calculate confidence in the difficulty rating based on sample size and variance.
 * Confidence reaches ~0.95 at 1000 answers.
 */
export function calculateConfidence(
  totalAnswers: number,
  recentHistory: boolean[],
  currentDifficulty: number
): number {
  const sampleConfidence = Math.min(totalAnswers / MAX_CONFIDENCE_SAMPLES, 1)
  
  if (recentHistory.length === 0) {
    return sampleConfidence * 0.5
  }

  const expectedSuccessRate = 1 - (currentDifficulty * 0.8 + 0.1)
  const actualSuccessRate = recentHistory.filter(x => x).length / recentHistory.length
  const variance = Math.abs(expectedSuccessRate - actualSuccessRate)
  const varianceConfidence = 1 - Math.min(variance * 2, 1)
  
  return Math.sqrt(sampleConfidence * varianceConfidence)
}

/**
 * Calculate adjustment magnitude based on confidence.
 * Low confidence = larger adjustments (0.10), High confidence = smaller adjustments (0.001).
 */
export function calculateAdjustmentMagnitude(confidence: number): number {
  const MIN_ADJUSTMENT = 0.001
  const MAX_ADJUSTMENT = 0.10
  
  const inverseConfidenceSquared = Math.pow(1 - confidence, 2)
  return MIN_ADJUSTMENT + (inverseConfidenceSquared * (MAX_ADJUSTMENT - MIN_ADJUSTMENT))
}

/**
 * Calculate new difficulty based on this round's performance.
 * Adjusts based on how actual performance compares to expected for current difficulty.
 */
export function calculateAdaptiveDifficulty(
  currentDifficulty: number,
  stats: QuestionStats,
  newCorrectCount: number,
  newIncorrectCount: number
): DifficultyUpdate {
  const updatedCorrectCount = stats.correct_count + newCorrectCount
  const updatedIncorrectCount = stats.incorrect_count + newIncorrectCount
  const totalAnswers = updatedCorrectCount + updatedIncorrectCount
  
  const updatedHistory = [...stats.recent_history]
  for (let i = 0; i < newCorrectCount; i++) {
    updatedHistory.push(true)
  }
  for (let i = 0; i < newIncorrectCount; i++) {
    updatedHistory.push(false)
  }
  
  const recentHistory = updatedHistory.slice(-RECENT_HISTORY_SIZE)
  const confidence = calculateConfidence(totalAnswers, recentHistory, currentDifficulty)
  const adjustmentMagnitude = calculateAdjustmentMagnitude(confidence)
  
  const totalThisRound = newCorrectCount + newIncorrectCount
  const expectedSuccessRate = 1 - (currentDifficulty * 0.8 + 0.1)
  const expectedCorrect = totalThisRound * expectedSuccessRate
  const actualCorrect = newCorrectCount
  const unexpectedDifference = actualCorrect - expectedCorrect
  
  const normalizedDifference = totalThisRound > 0 ? unexpectedDifference / totalThisRound : 0
  const scaleFactor = Math.min(Math.abs(normalizedDifference) * 2, 1)
  
  let adjustment = 0
  if (normalizedDifference > 0) {
    adjustment = -adjustmentMagnitude * scaleFactor
  } else if (normalizedDifference < 0) {
    adjustment = adjustmentMagnitude * scaleFactor
  }
  
  const newDifficulty = Math.max(0, Math.min(1, currentDifficulty + adjustment))
  
  return {
    newDifficulty,
    confidence,
    adjustment
  }
}
