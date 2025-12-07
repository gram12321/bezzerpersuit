import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ========================================
// NUMBER & CURRENCY FORMATTING
// ========================================

/**
 * Unified number formatting function that handles regular numbers, currency, and compact notation
 * 
 * @param value The number to format
 * @param options Formatting options
 * @returns Formatted number string
 * 
 * @example
 * formatNumber(1234.5) // "1,234.50"
 * formatNumber(1234.56, { currency: true }) // "$1,235"
 * formatNumber(1234567, { currency: true, compact: true }) // "$1.2M"
 * formatNumber(1234567, { compact: true }) // "1.2M"
 */
export function formatNumber(value: number, options?: {
  decimals?: number;
  forceDecimals?: boolean;
  currency?: boolean;
  compact?: boolean;
  percent?: boolean;
  percentIsDecimal?: boolean;
}): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return options?.currency ? '$0' : '0';
  }
  
  const { 
    decimals, 
    forceDecimals = false, 
    currency = false,
    compact = false,
    percent = false,
    percentIsDecimal = true
  } = options || {};

  // Handle percentage formatting
  if (percent) {
    const finalDecimals = decimals !== undefined ? decimals : 1;
    const percentage = percentIsDecimal ? value * 100 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals
    }).format(percentage / 100);
  }

  // Handle compact notation
  if (compact) {
    const absValue = Math.abs(value);
    const compactDecimals = decimals !== undefined ? decimals : 1;
    
    let compactValue: string;
    if (absValue >= 1e12) {
      compactValue = (value / 1e12).toFixed(compactDecimals) + 'T';
    } else if (absValue >= 1e9) {
      compactValue = (value / 1e9).toFixed(compactDecimals) + 'B';
    } else if (absValue >= 1e6) {
      compactValue = (value / 1e6).toFixed(compactDecimals) + 'M';
    } else if (absValue >= 1e3) {
      compactValue = (value / 1e3).toFixed(compactDecimals) + 'K';
    } else {
      compactValue = value.toFixed(compactDecimals);
    }
    
    return currency ? '$' + compactValue : compactValue;
  }
  
  // Handle currency formatting
  if (currency) {
    const finalDecimals = decimals !== undefined ? decimals : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals
    }).format(value);
  }
  
  // Regular number formatting
  const effectiveDecimals = decimals ?? 2;
  
  // For large numbers, don't show decimals unless forced
  if (Math.abs(value) >= 1000 && !forceDecimals) {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
  }
  
  // For whole numbers, don't show decimals unless forced
  if (Number.isInteger(value) && !forceDecimals) {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
  }
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: forceDecimals ? effectiveDecimals : 0,
    maximumFractionDigits: effectiveDecimals
  });
}

/**
 * Format a number as percentage
 * 
 * @param value The number to format (0-1 range or 0-100 range)
 * @param decimals Number of decimal places (default: 1)
 * @param isDecimal Whether the input is in decimal form (0-1) or percentage form (0-100)
 * @returns Formatted percentage string
 * 
 * @example
 * formatPercent(0.873, 1) // "87.3%"
 * formatPercent(87.3, 1, false) // "87.3%"
 */
export function formatPercent(value: number, decimals: number = 1, isDecimal: boolean = true): string {
  return formatNumber(value, { percent: true, decimals, percentIsDecimal: isDecimal });
}

// ========================================
// DATE & TIME FORMATTING
// ========================================

/**
 * Format timestamp as HH:MM:SS
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Format a date as a readable string
 * 
 * @param date The date to format
 * @param includeTime Whether to include time (default: false)
 * @returns Formatted date string
 */
export function formatDate(date: Date, includeTime: boolean = false): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 'Invalid Date';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', options);
}

// ========================================
// RANDOM UTILITIES
// ========================================

/**
 * Get a random element from an array
 */
export function getRandomFromArray<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random number within a range
 */
export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Clamp a value between 0 and 1
 */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

// ========================================
// QUIZ DIFFICULTY LEVELS
// ========================================

interface DifficultyLevel {
  max: number
  category: string
  description: string
}

const QUIZ_DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { max: 0.1, category: 'Trivial', description: 'Practically answers itself—even a trivia novice will nail it.' },
  { max: 0.2, category: 'Easy Pickings', description: 'Low-challenge questions; basic knowledge will get you through.' },
  { max: 0.3, category: 'Comfort Zone', description: 'Straightforward but requires some actual thinking.' },
  { max: 0.4, category: 'Brain Tickler', description: 'Demands a bit of focus and depth of knowledge.' },
  { max: 0.5, category: 'Requires Finesse', description: 'Rewards careful reading and sharp recall.' },
  { max: 0.6, category: 'Tricky Territory', description: 'Picky questions that catch the unprepared—expect some gotchas.' },
  { max: 0.7, category: 'Brain Buster', description: 'Demands deep knowledge and you\'ll need to really think hard.' },
  { max: 0.8, category: 'High-Wire Act', description: 'Success feels like a miracle; one slip and you\'re done.' },
  { max: 0.9, category: 'PhD-Level Madness', description: 'For masochists only. Experts might even struggle here.' },
]

/**
 * Get quiz difficulty category and description based on difficulty value (0-1)
 * 
 * @param difficulty Difficulty value (0-1)
 * @returns Object with category name and description
 * 
 * @example
 * getDifficultyLevel(0.2) // { category: 'Easy Pickings', description: '...' }
 * getDifficultyLevel(0.75) // { category: 'Brain Buster', description: '...' }
 */
export function getDifficultyLevel(difficulty: number): DifficultyLevel {
  const clamped = clamp01(difficulty)
  const level = QUIZ_DIFFICULTY_LEVELS.find(entry => clamped <= entry.max)
  return level || QUIZ_DIFFICULTY_LEVELS[QUIZ_DIFFICULTY_LEVELS.length - 1]
}

/**
 * Format difficulty score (0-1) as a readable label
 * 
 * @param difficulty Difficulty value (0-1)
 * @returns Readable difficulty category label
 * 
 * @example
 * formatDifficulty(0.2) // "Easy Pickings"
 * formatDifficulty(0.5) // "Requires Finesse"
 * formatDifficulty(0.8) // "High-Wire Act"
 */
export function formatDifficulty(difficulty: number): string {
  return getDifficultyLevel(difficulty).category
}

/**
 * Get color classes for difficulty badge based on difficulty value (0-1)
 * 
 * @param difficulty Difficulty value (0-1)
 * @returns Tailwind color classes for the badge
 * 
 * @example
 * getDifficultyColorClasses(0.2) // "bg-green-600/30 text-green-300"
 * getDifficultyColorClasses(0.5) // "bg-yellow-600/30 text-yellow-300"
 * getDifficultyColorClasses(0.8) // "bg-red-600/30 text-red-300"
 */
export function getDifficultyColorClasses(difficulty: number): string {
  const clamped = clamp01(difficulty)
  
  if (clamped < 0.2) return 'bg-green-600/30 text-green-300'
  if (clamped < 0.4) return 'bg-emerald-600/30 text-emerald-300'
  if (clamped < 0.6) return 'bg-yellow-600/30 text-yellow-300'
  if (clamped < 0.8) return 'bg-orange-600/30 text-orange-300'
  return 'bg-red-600/30 text-red-300'
}
