-- Final profile setup and verification

-- Ensure all profile fields are properly configured
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT,
ADD COLUMN IF NOT EXISTS avatar_file_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_file_size INTEGER DEFAULT 0;

-- Update the profile update trigger to handle avatar changes
CREATE OR REPLACE FUNCTION public.handle_profile_avatar_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Log avatar changes
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    RAISE NOTICE 'Avatar updated for user: %', NEW.id;
  END IF;
  
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for avatar updates
DROP TRIGGER IF EXISTS handle_profile_avatar_update ON public.profiles;
CREATE TRIGGER handle_profile_avatar_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_avatar_update();

-- Verify the setup
SELECT 
  'Profile Setup Verification' as check_type,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 END) as profiles_with_avatars,
  COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as profiles_with_names
FROM public.profiles;

SELECT 'Profile setup completed successfully!' as status;
