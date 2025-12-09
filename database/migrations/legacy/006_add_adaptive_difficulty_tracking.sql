-- Add adaptive difficulty tracking fields to questions table
-- Run this in Supabase SQL Editor

-- Add columns for tracking question performance
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS incorrect_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS recent_history BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[] NOT NULL;

-- Add constraint to ensure counts are non-negative
ALTER TABLE questions 
ADD CONSTRAINT correct_count_non_negative CHECK (correct_count >= 0),
ADD CONSTRAINT incorrect_count_non_negative CHECK (incorrect_count >= 0);

-- Add index for performance
CREATE INDEX IF NOT EXISTS questions_total_answers_idx 
  ON questions ((correct_count + incorrect_count));

-- Add comment explaining the fields
COMMENT ON COLUMN questions.correct_count IS 'Total number of correct answers by human players (excludes AI)';
COMMENT ON COLUMN questions.incorrect_count IS 'Total number of incorrect answers by human players (excludes AI)';
COMMENT ON COLUMN questions.recent_history IS 'Last 10 answers: true = correct, false = incorrect (human players only)';
