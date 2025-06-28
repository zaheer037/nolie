-- Verify database setup
SELECT 'Starting verification...' as status;

-- Check if tables exist
SELECT 
  'Tables Check' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN '✅ profiles table exists'
    ELSE '❌ profiles table missing'
  END as profiles_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'analysis_reports'
    ) THEN '✅ analysis_reports table exists'
    ELSE '❌ analysis_reports table missing'
  END as reports_status;

-- Check RLS status
SELECT 
  'RLS Check' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'analysis_reports');

-- Check policies
SELECT 
  'Policies Check' as check_type,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'analysis_reports')
ORDER BY tablename, cmd;

-- Check triggers
SELECT 
  'Triggers Check' as check_type,
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('profiles', 'analysis_reports')
ORDER BY event_object_table;

-- Check functions
SELECT 
  'Functions Check' as check_type,
  routine_name as function_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'handle_updated_at');

SELECT 'Verification completed!' as status;
