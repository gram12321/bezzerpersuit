-- 011_revert_category_changes.sql
-- Revert the category canonicalization changes added by previous migrations.
-- WARNING: This will DROP the `categories_canonical` column and the GIN index
-- and will DROP the `normalize_text` helper function if present. Back up your DB first.

BEGIN;

-- Drop the GIN index if it exists
DROP INDEX IF EXISTS idx_questions_categories_canonical_gin;

-- Drop the canonical column if it exists
ALTER TABLE questions
  DROP COLUMN IF EXISTS categories_canonical;

-- Optionally drop the helper function (safe if not used elsewhere)
DROP FUNCTION IF EXISTS normalize_text(TEXT);

COMMIT;

-- After running: verify with
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='questions' AND column_name IN ('categories','categories_canonical');
