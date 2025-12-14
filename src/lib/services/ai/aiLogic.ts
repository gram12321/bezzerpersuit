import type { Question, Player, QuestionCategory, DifficultyScore, AIPersonality } from '@/lib/utils'
import { QUIZ_CATEGORIES, createDifficultyScore } from '@/lib/utils'
import { getAvailableCategories, getAvailableDifficulties } from '@/lib/services/gameService'

/**
 * AI Logic - Handles AI player behavior and decision making
 */

/**
 * Strategically select both category AND difficulty as a pair
 * AI pairs strong categories with high difficulties, weak categories with low difficulties
 * 
 * @param aiPersonality - AI personality with category modifiers
 * @param usedCategories - Categories already used this game
 * @param usedDifficulties - Difficulties already used this game
 * @returns Object with selected category and difficulty
 */
export function selectAICategoryAndDifficulty(
  aiPersonality: AIPersonality | undefined,
  usedCategories: QuestionCategory[] = [],
  usedDifficulties: DifficultyScore[] = []
): { category: QuestionCategory; difficulty: DifficultyScore } {
  const availableCategories = getAvailableCategories(usedCategories)
  const availableDifficulties = getAvailableDifficulties(usedDifficulties)
  
  // Fallback if no available options (shouldn't happen due to reset logic)
  if (availableCategories.length === 0 || availableDifficulties.length === 0) {
    const category = availableCategories.length > 0 
      ? availableCategories[Math.floor(Math.random() * availableCategories.length)]
      : QUIZ_CATEGORIES[Math.floor(Math.random() * QUIZ_CATEGORIES.length)]
    const difficulty = availableDifficulties.length > 0
      ? availableDifficulties[Math.floor(Math.random() * availableDifficulties.length)]
      : createDifficultyScore(0.3 + Math.random() * 0.4)
    return { category, difficulty }
  }
  
  // If no personality, pick randomly
  if (!aiPersonality) {
    return {
      category: availableCategories[Math.floor(Math.random() * availableCategories.length)],
      difficulty: availableDifficulties[Math.floor(Math.random() * availableDifficulties.length)]
    }
  }
  
  // Rank categories by AI's modifier strength, with random blur
  const rankedCategories = availableCategories
    .map(cat => {
      // Blur the AI's perception of its own skill in each category
      const baseMod = aiPersonality.categoryModifiers[cat] || 0
      const blur = (Math.random() - 0.5) * 0.2 // ±0.1 blur
      return {
        category: cat,
        modifier: baseMod + blur
      }
    })
    .sort((a, b) => b.modifier - a.modifier)
  
  // Rank difficulties (high to low)
  const sortedDifficulties = [...availableDifficulties].sort((a, b) => b - a)
  
  // Categorize into tiers
  const strongCategories = rankedCategories.filter(c => c.modifier > 0.05)
  const weakCategories = rankedCategories.filter(c => c.modifier < -0.05)
  const neutralCategories = rankedCategories.filter(c => c.modifier >= -0.05 && c.modifier <= 0.05)
  
  // Categorize difficulties into tiers
  const mediumDifficulties = sortedDifficulties.filter(d => d > 0.3 && d < 0.6)
  const lowDifficulties = sortedDifficulties.filter(d => d <= 0.3)
  
  // Strategic pairing logic with imperfect self-assessment
  let selectedCategory: QuestionCategory
  let selectedDifficulty: DifficultyScore

  // Helper: pick from top N categories
  function pickFromTop(ranked: { category: QuestionCategory; modifier: number }[], n = 1) {
    const top = ranked.slice(0, Math.min(n, ranked.length))
    return top[Math.floor(Math.random() * top.length)].category
  }

  // Prefer difficulty close to AI's base skill for best category
  if (strongCategories.length > 0) {
    // Pick best category (with some randomness)
    selectedCategory = Math.random() < 0.3
      ? pickFromTop(strongCategories, 3)
      : pickFromTop(strongCategories, 1)
    // Find difficulty closest to base skill
    // Blur the AI's perception of its own base skill and add category modifier
    const baseSkillTrue = aiPersonality.baseSuccessRate || 0.5
    const catMod = aiPersonality.categoryModifiers[selectedCategory] || 0
    const skillEstimate = baseSkillTrue + catMod + ((Math.random() - 0.5) * 0.2) // ±0.1 blur
    // Only consider available difficulties for this category
    let bestDiff = availableDifficulties[0]
    let minDist = Math.abs(availableDifficulties[0] - skillEstimate)
    for (const d of availableDifficulties) {
      const dist = Math.abs(d - skillEstimate)
      if (dist < minDist) {
        bestDiff = d
        minDist = dist
      }
    }
    selectedDifficulty = bestDiff
  }
  // Use low difficulty with weak categories
  else if (lowDifficulties.length > 0 && weakCategories.length > 0) {
    selectedCategory = Math.random() < 0.3
      ? pickFromTop(weakCategories, 3)
      : pickFromTop(weakCategories, 1)
    selectedDifficulty = lowDifficulties[Math.floor(Math.random() * lowDifficulties.length)]
  }
  // Medium difficulty with neutral or best available
  else if (mediumDifficulties.length > 0) {
    const categoriesToPick = neutralCategories.length > 0 ? neutralCategories : rankedCategories
    selectedCategory = Math.random() < 0.3
      ? pickFromTop(categoriesToPick, 3)
      : pickFromTop(categoriesToPick, 1)
    selectedDifficulty = mediumDifficulties[Math.floor(Math.random() * mediumDifficulties.length)]
  }
  // Fallback: pair best available
  else {
    selectedCategory = pickFromTop(rankedCategories, 1)
    selectedDifficulty = sortedDifficulties[0]
  }

  return { category: selectedCategory, difficulty: selectedDifficulty }
}

/**
 * Decide if AI should use "I Know!" boost
 * Basic logic: Use boost in strongest category if available
 * 
 * @param player - AI player
 * @param question - Current question
 * @param currentTurnPlayerId - ID of the turn player
 * @param playerIndex - Index of this AI player
 * @returns true if AI should use boost
 */
export function shouldAIUseBoost(
  player: Player,
  question: Question,
  currentTurnPlayerId: string
): boolean {
  // Can't use if you're the turn player
  if (player.id === currentTurnPlayerId) {
    return false
  }
  
  // Must have boosts available
  if ((player.iKnowPowerupsRemaining || 0) <= 0) {
    return false
  }
  
  // Can't use if already used this round
  if (player.usedIKnowThisRound) {
    return false
  }
  
  const personality = player.aiPersonality
  if (!personality) {
    return false // No personality = no boost usage
  }
  
  // Check if this question is in AI's strong category
  let isStrongCategory = false
  let highestModifier = 0
  
  for (const cat of question.categories) {
    const modifier = personality.categoryModifiers[cat] || 0
    if (modifier > highestModifier) {
      highestModifier = modifier
    }
  }
  
  // Consider it a strong category if modifier > 0.1
  isStrongCategory = highestModifier > 0.1
  
  // Use boost with probability based on boostUsageRate, but only in strong categories
  if (isStrongCategory) {
    return Math.random() < personality.boostUsageRate
  }
  
  return false
}

/**
 * Process AI boost decisions for all AI players
 * AIs decide whether to use "I Know!" boost based on their personality
 * 
 * @param players - All players in the game
 * @param question - Current question
 * @param currentTurnPlayerId - ID of the turn player
 * @returns Updated players array with boost decisions applied
 */
export function processAIBoosts(
  players: Player[],
  question: Question,
  currentTurnPlayerId: string
): Player[] {
  return players.map(player => {
    if (player.isAI && shouldAIUseBoost(player, question, currentTurnPlayerId)) {
      return {
        ...player,
        usedIKnowThisRound: true,
        iKnowPowerupsRemaining: (player.iKnowPowerupsRemaining || 0) - 1
      }
    }
    return player
  })
}

/**
 * Generate AI answers for all AI players
 * Sets hasAnswered and selectedAnswer for each AI
 * Answer generation uses AI personality: baseSuccessRate, categoryModifiers, and consistency
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
      const personality = player.aiPersonality
      
      // Calculate success chance based on question difficulty and personality
      // Start with difficulty: easier questions = higher base chance
      let baseChance = 1 - question.difficulty
      
      if (personality) {
        // Adjust by AI's overall skill level (relative to average player)
        // baseSuccessRate of 0.5 = average, 0.8 = expert, 0.3 = novice
        const skillAdjustment = (personality.baseSuccessRate - 0.5) * 0.5 // ±25% max
        baseChance += skillAdjustment
        
        // Apply category modifier for any matching categories
        // Use the highest modifier if question has multiple categories
        let categoryModifier = 0
        for (const cat of question.categories) {
          const modifier = personality.categoryModifiers[cat] || 0
          if (Math.abs(modifier) > Math.abs(categoryModifier)) {
            categoryModifier = modifier
          }
        }
        baseChance += categoryModifier
        
        // Apply consistency variance (higher consistency = more reliable)
        const variance = (1 - personality.consistency) * 0.3 // Max ±30% variance when consistency is 0
        const randomAdjustment = (Math.random() - 0.5) * 2 * variance
        baseChance += randomAdjustment
        
        // Clamp between 0 and 1
        baseChance = Math.max(0, Math.min(1, baseChance))
      }
      
      const willAnswerCorrectly = Math.random() < baseChance
      
      let aiAnswer: number
      if (willAnswerCorrectly) {
        aiAnswer = question.correctAnswerIndex
      } else {
        // Pick a random wrong answer
        const wrongAnswers = question.answers
          .map((_, index) => index)
          .filter(index => index !== question.correctAnswerIndex)
        aiAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]
      }
      
      return {
        ...player,
        hasAnswered: true,
        selectedAnswer: aiAnswer
      }
    }
    return player
  })
}
