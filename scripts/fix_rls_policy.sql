-- 喵評鑑資安修正：收回 anon 的 UPDATE 權限
-- 在 Supabase Dashboard > SQL Editor 執行
--
-- 問題：目前 anon（匿名，也就是任何前端訪客）可以直接 UPDATE
-- cat_foods 和 reviews 表格的任何一列。因為 anon key 是
-- NEXT_PUBLIC_ 開頭，會曝露在瀏覽器裡，任何人都能用它直接呼叫
-- Supabase REST API 竄改分數、竄改留言審核狀態。
--
-- 這支 SQL 會移除 anon 的 UPDATE policy，只保留 SELECT（公開讀取）
-- 和 INSERT（reviews 表要讓訪客送出留言，仍然需要）。

-- 1. 移除 cat_foods 的 anon UPDATE policy（改分數用的更新一律走
--    Service Role Key 的後端腳本，不透過前端 anon key）
DROP POLICY IF EXISTS "Enable update for anon" ON cat_foods;
DROP POLICY IF EXISTS "anon update" ON cat_foods;
DROP POLICY IF EXISTS "Allow anon update" ON cat_foods;

-- 2. 移除 reviews 的 anon UPDATE policy（審核留言用的更新一律走
--    Supabase Dashboard 手動改 status，不透過前端）
DROP POLICY IF EXISTS "Enable update for anon" ON reviews;
DROP POLICY IF EXISTS "anon update" ON reviews;
DROP POLICY IF EXISTS "Allow anon update" ON reviews;

-- 3. 確認結果：執行完後跑這行檢查兩張表還剩什麼 policy
-- 應該只看到 SELECT 和 INSERT，不該再有 UPDATE
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('cat_foods', 'reviews')
ORDER BY tablename, cmd;
