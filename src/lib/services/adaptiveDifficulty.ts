/**
 * Adaptive Difficulty System
 * 
 * This system tracks question performance and adjusts difficulty based on:
 * 1. Historical correct/incorrect answer counts
 * 2. Recent answer history (last 10 answers)
 * 3. Confidence level based on sample size and variance from expected
 * 
 * Only counts HUMAN player answers - AI answers are excluded.
 */

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
 * Calculate confidence in the difficulty rating
 * 
 * Confidence is based on:
 * 1. Sample size (more answers = more confidence, up to 1000)
 * 2. Variance from expected (closer to expected = more confidence)
 * 
 * @param totalAnswers - Total number of answers (correct + incorrect)
 * @param recentHistory - Array of recent answers (true = correct)
 * @param currentDifficulty - Current difficulty (0-1, where 0 = easy, 1 = hard)
 * @returns Confidence value (0-1)
 */
export function calculateConfidence(
  totalAnswers: number,
  recentHistory: boolean[],
  currentDifficulty: number
): number {
  // Sample size confidence (0-1): reaches ~0.95 at 1000 answers
  const sampleConfidence = Math.min(totalAnswers / MAX_CONFIDENCE_SAMPLES, 1)
  
  if (recentHistory.length === 0) {
    return sampleConfidence * 0.5 // Low confidence if no recent history
  }

  // Expected success rate based on difficulty
  // difficulty 0 (easy) = 90% success, difficulty 1 (hard) = 10% success
  const expectedSuccessRate = 1 - (currentDifficulty * 0.8 + 0.1)
  
  // Actual recent success rate
  const actualSuccessRate = recentHistory.filter(x => x).length / recentHistory.length
  
  // Variance confidence: how close actual is to expected (0-1)
  // Lower variance = higher confidence
  const variance = Math.abs(expectedSuccessRate - actualSuccessRate)
  const varianceConfidence = 1 - Math.min(variance * 2, 1) // Scale variance to 0-1
  
  // Combined confidence (geometric mean to penalize low values)
  return Math.sqrt(sampleConfidence * varianceConfidence)
}

/**
 * Calculate adjustment magnitude based on confidence
 * 
 * Low confidence = larger adjustments (up to 0.10)
 * High confidence = smaller adjustments (down to 0.01)
 * 
 * @param confidence - Confidence value (0-1)
 * @returns Adjustment magnitude (0.01-0.10)
 */
export function calculateAdjustmentMagnitude(confidence: number): number {
  const MIN_ADJUSTMENT = 0.01
  const MAX_ADJUSTMENT = 0.10
  
  // Inverse relationship: low confidence = high adjustment
  return MAX_ADJUSTMENT - (confidence * (MAX_ADJUSTMENT - MIN_ADJUSTMENT))
}

/**
 * Calculate new difficulty based on recent performance with confidence-based adjustment
 * 
 * @param currentDifficulty - Current difficulty (0-1)
 * @param stats - Question statistics
 * @param newCorrectCount - How many players got it correct this round
 * @param newIncorrectCount - How many players got it incorrect this round
 * @returns Updated difficulty info
 */
export function calculateAdaptiveDifficulty(
  currentDifficulty: number,
  stats: QuestionStats,
  newCorrectCount: number,
  newIncorrectCount: number
): DifficultyUpdate {
  // Update stats with new answers
  const updatedCorrectCount = stats.correct_count + newCorrectCount
  const updatedIncorrectCount = stats.incorrect_count + newIncorrectCount
  const totalAnswers = updatedCorrectCount + updatedIncorrectCount
  
  // Update recent history (keep last 10)
  const updatedHistory = [...stats.recent_history]
  for (let i = 0; i < newCorrectCount; i++) {
    updatedHistory.push(true)
  }
  for (let i = 0; i < newIncorrectCount; i++) {
    updatedHistory.push(false)
  }
  
  // Keep only most recent RECENT_HISTORY_SIZE answers
  const recentHistory = updatedHistory.slice(-RECENT_HISTORY_SIZE)
  
  // Calculate confidence
  const confidence = calculateConfidence(totalAnswers, recentHistory, currentDifficulty)
  
  // Calculate expected success rate based on current difficulty
  // difficulty 0 (easy) = 90% success, difficulty 1 (hard) = 10% success
  const expectedSuccessRate = 1 - (currentDifficulty * 0.8 + 0.1)
  
  // Calculate actual recent success rate
  const actualSuccessRate = recentHistory.length > 0
    ? recentHistory.filter(x => x).length / recentHistory.length
    : 0.5
  
  // Determine direction and magnitude of adjustment
  const difference = actualSuccessRate - expectedSuccessRate
  const adjustmentMagnitude = calculateAdjustmentMagnitude(confidence)
  
  // If actual > expected: question is too easy, increase difficulty
  // If actual < expected: question is too hard, decrease difficulty
  let adjustment = 0
  
  if (Math.abs(difference) > 0.1) { // Only adjust if difference is significant
    if (difference > 0.2) {
      // Much too easy
      adjustment = adjustmentMagnitude
    } else if (difference > 0.1) {
      // Somewhat too easy
      adjustment = adjustmentMagnitude * 0.5
    } else if (difference < -0.2) {
      // Much too hard
      adjustment = -adjustmentMagnitude
    } else if (difference < -0.1) {
      // Somewhat too hard
      adjustment = -adjustmentMagnitude * 0.5
    }
  }
  
  // Apply adjustment and clamp to [0, 1]
  const newDifficulty = Math.max(0, Math.min(1, currentDifficulty + adjustment))
  
  return {
    newDifficulty,
    confidence,
    adjustment
  }
}
