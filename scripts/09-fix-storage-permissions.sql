-- This script fixes storage permissions for the avatars bucket

-- First, check if the avatars bucket exists
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'avatars'
  ) INTO bucket_exists;

  IF NOT bucket_exists THEN
    -- Create the avatars bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('avatars', 'avatars', true, false, 5242880, '{image/jpeg,image/png,image/gif,image/webp}');
    
    RAISE NOTICE 'Created avatars bucket';
  ELSE
    RAISE NOTICE 'Avatars bucket already exists';
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- Create policies for the storage.objects table

-- 1. Allow public read access to avatars
CREATE POLICY "Allow public read access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- 2. Allow authenticated users to upload files to their own folder
CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Allow users to update their own files
CREATE POLICY "Allow users to update their own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Verify the policies were created
SELECT
  policy,
  definition,
  permissive,
  roles,
  cmd
FROM
  pg_policies
WHERE
  tablename = 'objects' AND
  schemaname = 'storage';

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'Storage permissions have been successfully configured';
END $$;
