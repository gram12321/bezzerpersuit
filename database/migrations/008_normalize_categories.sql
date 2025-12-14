-- 008_normalize_categories.sql
-- Normalize category text to canonical QUIZ_CATEGORIES and add canonical column + GIN index
-- Run in Supabase SQL editor or via your migration runner. Test on staging first.

BEGIN;

-- Helper: normalize text (trim, collapse spaces, lowercase)
CREATE OR REPLACE FUNCTION normalize_text(input TEXT) RETURNS TEXT
LANGUAGE SQL IMMUTABLE AS $$
  SELECT lower(regexp_replace(trim(input), '\\s+', ' ', 'g'));
$$;

-- Backfill: map each category entry to canonical QUIZ_CATEGORIES where possible
WITH mapping(canonical, norm) AS (
  VALUES
    ('Geography', normalize_text('Geography')),
    ('Nature and Ecology', normalize_text('Nature and Ecology')),
    ('Natural Sciences', normalize_text('Natural Sciences')),
    ('Technology and Engineering', normalize_text('Technology and Engineering')),
    ('Visual Arts and Design', normalize_text('Visual Arts and Design')),
    ('Literature and Narrative Arts', normalize_text('Literature and Narrative Arts')),
    ('History', normalize_text('History')),
    ('Sports, Games, and Entertainment', normalize_text('Sports, Games, and Entertainment')),
    ('Food and Cooking', normalize_text('Food and Cooking')),
    ('Music and Performing Arts', normalize_text('Music and Performing Arts')),
    ('Business and Economics', normalize_text('Business and Economics')),
    ('Mythology and Religion', normalize_text('Mythology and Religion')),
    ('Philosophy and Critical Thinking', normalize_text('Philosophy and Critical Thinking')),
    ('Medicine and Health Sciences', normalize_text('Medicine and Health Sciences')),
    ('Law, Government, and Politics', normalize_text('Law, Government, and Politics')),
    ('General Knowledge', normalize_text('General Knowledge'))
)
-- Update categories to canonical values, but don't overwrite with NULL.
UPDATE questions q
SET categories = COALESCE((
  SELECT array_agg(coalesce(m.canonical, t.c) ORDER BY t.ord)
  FROM unnest(q.categories) WITH ORDINALITY AS t(c, ord)
  LEFT JOIN mapping m ON normalize_text(t.c) = m.norm
), q.categories)
WHERE q.categories IS NOT NULL;

-- Optionally keep a canonical column and index for fast queries
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS categories_canonical TEXT[];

UPDATE questions
SET categories_canonical = categories
WHERE categories_canonical IS NULL OR categories_canonical <> categories;

CREATE INDEX IF NOT EXISTS idx_questions_categories_canonical_gin
  ON questions USING GIN (categories_canonical);

COMMIT;
