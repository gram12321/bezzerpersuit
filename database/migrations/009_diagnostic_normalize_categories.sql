-- 009_diagnostic_normalize_categories.sql
-- Diagnostics + targeted fix for unmapped category variants
-- Run in Supabase SQL editor or psql. Review SELECT outputs before running the UPDATE section.

-- 1) Does normalize_text() exist?
SELECT proname, oidvectortypes(proargtypes) AS args
FROM pg_proc
WHERE proname = 'normalize_text';

-- 2) Basic counts and containment checks
SELECT
  (SELECT COUNT(*) FROM questions) AS total_questions,
  (SELECT COUNT(*) FROM questions WHERE categories IS NULL) AS categories_null,
  (SELECT COUNT(*) FROM questions WHERE categories_canonical IS NULL) AS categories_canonical_null,
  (SELECT COUNT(*) FROM questions WHERE categories @> ARRAY['Sports, Games, and Entertainment']) AS contains_canonical,
  (SELECT COUNT(*) FROM questions WHERE categories_canonical @> ARRAY['Sports, Games, and Entertainment']) AS canonical_contains;

-- 3) Distinct raw strings that normalize to the canonical normalized value
SELECT DISTINCT c AS raw_value, normalize_text(c) AS norm, count(*) AS cnt
FROM questions, unnest(categories) AS c
WHERE normalize_text(c) = normalize_text('Sports, Games, and Entertainment')
GROUP BY raw_value, norm
ORDER BY cnt DESC;

-- 4) Rows where an item normalizes to the target but the canonical column does NOT contain the canonical string
SELECT q.id, q.categories, q.categories_canonical
FROM questions q
WHERE EXISTS (
  SELECT 1 FROM unnest(q.categories) AS c
  WHERE normalize_text(c) = normalize_text('Sports, Games, and Entertainment')
)
AND NOT (coalesce(q.categories_canonical, q.categories) @> ARRAY['Sports, Games, and Entertainment'])
LIMIT 200;

-- 5) Difficulty distribution for rows that normalize to the target (helps explain empty tiers)
SELECT q.id, q.difficulty, q.categories, q.categories_canonical
FROM questions q
WHERE EXISTS (
  SELECT 1 FROM unnest(q.categories) AS c
  WHERE normalize_text(c) = normalize_text('Sports, Games, and Entertainment')
)
ORDER BY q.difficulty;

-- === Optional: Targeted fix ===
-- This will rebuild `categories_canonical` for rows that contain
-- a category which normalizes to 'Sports, Games, and Entertainment',
-- using the same canonical mapping as your migration, but only for affected rows.
-- Review the SELECT results above. Run the UPDATE only if the SELECTs show mismatches.

-- BEGIN; -- uncomment to run in a transaction
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
  SELECT array_agg(coalesce(m.canonical, t.c) ORDER BY t.ord)
  FROM unnest(q.categories) WITH ORDINALITY AS t(c, ord)
  LEFT JOIN mapping m ON normalize_text(t.c) = m.norm
), q.categories_canonical)
WHERE EXISTS (
  SELECT 1 FROM unnest(q.categories) AS c
  WHERE normalize_text(c) = normalize_text('Sports, Games, and Entertainment')
)
AND NOT (coalesce(q.categories_canonical, q.categories) @> ARRAY['Sports, Games, and Entertainment']);

-- COMMIT; -- uncomment if using transaction

-- After running, re-run the SELECTs above to verify the fix.
