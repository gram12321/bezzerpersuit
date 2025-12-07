-- Migration: Convert single category to categories array
-- This updates the existing questions table to support multiple categories per question

-- Step 1: Add new categories column as array (if it doesn't already exist)
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT NULL;

-- Step 2: Make categories column required
ALTER TABLE questions 
ALTER COLUMN categories SET NOT NULL;

-- Step 5: Drop old index and create new GIN index for efficient array queries
DROP INDEX IF EXISTS questions_category_idx;
CREATE INDEX IF NOT EXISTS questions_categories_idx ON questions USING GIN(categories);

-- Step 6: Update sample data to include multi-category examples
UPDATE questions 
SET categories = ARRAY['History', 'Science and Technology', 'Geography, Nature, and Environment']
WHERE question LIKE '%moon landing%' OR question LIKE '%Neil Armstrong%';

UPDATE questions 
SET categories = ARRAY['Science and Technology', 'General Knowledge']
WHERE question LIKE '%Red Planet%';

UPDATE questions 
SET categories = ARRAY['Art, Literature, and Culture', 'History']
WHERE question LIKE '%Mona Lisa%' OR question LIKE '%painted%';

UPDATE questions 
SET categories = ARRAY['Geography, Nature, and Environment', 'General Knowledge']
WHERE question LIKE '%largest ocean%';

-- Step 7: Insert new multi-category sample question
INSERT INTO questions (question, answers, correct_answer_index, categories, difficulty) 
VALUES (
  'In what city was the base of operations for the moon landing that Neil Armstrong called during the mission?',
  ARRAY['Houston', 'Cape Canaveral', 'Washington D.C.', 'Huntsville'],
  0,
  ARRAY['History', 'Science and Technology', 'Geography, Nature, and Environment'],
  0.6
)
ON CONFLICT DO NOTHING;

-- Migration complete
-- Questions now support multiple categories
