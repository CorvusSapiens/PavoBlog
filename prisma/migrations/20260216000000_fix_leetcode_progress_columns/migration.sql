-- Restore LeetCodeProgress.firstDate/latestDate (dropped by 20260215170000_drop_first_date) or rename snake_case
DO $$
BEGIN
  -- If columns were dropped: add them back with defaults
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND LOWER(table_name) = 'leetcodeprogress' AND column_name = 'firstDate'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND LOWER(table_name) = 'leetcodeprogress' AND column_name = 'first_date'
  ) THEN
    ALTER TABLE "LeetCodeProgress" ADD COLUMN "firstDate" DATE NOT NULL DEFAULT CURRENT_DATE;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND LOWER(table_name) = 'leetcodeprogress' AND column_name = 'first_date'
  ) THEN
    ALTER TABLE "LeetCodeProgress" RENAME COLUMN first_date TO "firstDate";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND LOWER(table_name) = 'leetcodeprogress' AND column_name = 'latestDate'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND LOWER(table_name) = 'leetcodeprogress' AND column_name = 'latest_date'
  ) THEN
    ALTER TABLE "LeetCodeProgress" ADD COLUMN "latestDate" DATE NOT NULL DEFAULT CURRENT_DATE;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND LOWER(table_name) = 'leetcodeprogress' AND column_name = 'latest_date'
  ) THEN
    ALTER TABLE "LeetCodeProgress" RENAME COLUMN latest_date TO "latestDate";
  END IF;
END $$;
