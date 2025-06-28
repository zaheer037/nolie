-- Test database setup
SELECT 'Testing database connection...' as status;

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ) THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM (
  VALUES ('profiles'), ('analysis_reports')
) as t(table_name);

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'analysis_reports');

-- Test inserting a sample record (this will fail if RLS is working correctly without auth)
-- This is expected to fail, which means RLS is working
DO $$
BEGIN
  INSERT INTO analysis_reports (
    user_id, 
    file_name, 
    analysis_results
  ) VALUES (
    gen_random_uuid(), 
    'test.txt', 
    '{"test": true}'::jsonb
  );
  RAISE NOTICE 'ERROR: RLS is not working - insert succeeded without authentication!';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'SUCCESS: RLS is working correctly - insert blocked without authentication';
  WHEN OTHERS THEN
    RAISE NOTICE 'UNEXPECTED ERROR: %', SQLERRM;
END $$;

SELECT 'Database test completed' as status;
