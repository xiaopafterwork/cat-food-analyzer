-- 喵評鑑 v3.0 schema migration
-- 在 Supabase Dashboard > SQL Editor 執行

ALTER TABLE cat_foods
  ADD COLUMN IF NOT EXISTS ash_dm_pct    float,
  ADD COLUMN IF NOT EXISTS fiber_dm_pct  float,
  ADD COLUMN IF NOT EXISTS carb_pct      float,
  ADD COLUMN IF NOT EXISTS country       text,
  ADD COLUMN IF NOT EXISTS ingredients_raw text,
  ADD COLUMN IF NOT EXISTS score_protein int,
  ADD COLUMN IF NOT EXISTS score_carb    int,
  ADD COLUMN IF NOT EXISTS score_quality int;
