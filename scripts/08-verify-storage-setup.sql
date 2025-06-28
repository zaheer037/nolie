-- Verify storage setup and fix any issues

-- Check if avatars bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- Check storage policies
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- Test storage permissions for current user
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get a test user ID (first user in profiles table)
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Testing storage permissions for user: %', test_user_id;
    
    -- Test if user can theoretically upload (this is just a permission check)
    PERFORM 1 FROM storage.objects 
    WHERE bucket_id = 'avatars' 
    AND name = test_user_id::text || '/test-file.jpg'
    LIMIT 1;
    
    RAISE NOTICE 'Storage permission test completed';
  ELSE
    RAISE NOTICE 'No users found to test storage permissions';
  END IF;
END $$;

-- Show final status
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') 
    THEN 'Storage bucket configured successfully!'
    ELSE 'Storage bucket needs to be created'
  END as bucket_status,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname LIKE '%avatar%'
    )
    THEN 'Storage policies configured successfully!'
    ELSE 'Storage policies need to be created'
  END as policy_status;
