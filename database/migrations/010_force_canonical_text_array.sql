-- 010_force_canonical_text_array.sql
-- Ensure `categories_canonical` is a TEXT[] containing canonical values,
-- populated from `categories` regardless of whether it's text[], json, or jsonb.
-- Safe to run multiple times. Run in Supabase SQL editor or via migration runner.

BEGIN;

-- Helper: normalize_text (idempotent)
CREATE OR REPLACE FUNCTION normalize_text(input TEXT) RETURNS TEXT
LANGUAGE SQL IMMUTABLE AS $$
  SELECT lower(regexp_replace(trim(input), '\\s+', ' ', 'g'));
$$;

-- Create canonical TEXT[] column if missing
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS categories_canonical TEXT[];

-- Populate categories_canonical using to_jsonb() to support text[]/json/jsonb uniformly
-- The canonical mapping is supplied as a CTE for the UPDATE below.
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
UPDATE questions q
SET categories_canonical = COALESCE((
  SELECT array_agg(coalesce(m.canonical, t.elem) ORDER BY t.ord)
  FROM jsonb_array_elements_text(to_jsonb(q.categories)) WITH ORDINALITY AS t(elem, ord)
  LEFT JOIN mapping m ON normalize_text(t.elem) = m.norm
), q.categories_canonical)
WHERE q.categories IS NOT NULL
  AND (
    q.categories_canonical IS NULL
    OR NOT (q.categories_canonical @> (
      SELECT array_agg(coalesce(m.canonical, t.elem) ORDER BY t.ord)
      FROM jsonb_array_elements_text(to_jsonb(q.categories)) WITH ORDINALITY AS t(elem, ord)
      LEFT JOIN mapping m ON normalize_text(t.elem) = m.norm
    ))
  );

-- Create GIN index for fast containment queries on the TEXT[] column
CREATE INDEX IF NOT EXISTS idx_questions_categories_canonical_gin
  ON questions USING GIN (categories_canonical);

COMMIT;

-- After running: confirm with
-- SELECT count(*) FROM questions WHERE categories_canonical @> ARRAY['Sports, Games, and Entertainment'];
