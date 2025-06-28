-- Update profiles table to better support avatars
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT,
ADD COLUMN IF NOT EXISTS avatar_file_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_file_size INTEGER DEFAULT 0;

-- Create storage bucket for avatars (this needs to be run in Supabase dashboard)
-- We'll create the bucket via the dashboard, but here's the policy setup

-- Enable storage for avatars
-- Note: You'll need to create a 'avatars' bucket in Supabase Storage first

-- Create storage policies (run after creating the bucket)
-- These will be created via the Supabase dashboard Storage section

SELECT 'Profile table updated for avatar support' as status;

-- Create function to handle avatar cleanup when profile is deleted
CREATE OR REPLACE FUNCTION public.cleanup_avatar_on_profile_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- This would ideally clean up the storage file too
  -- For now, we'll just log the deletion
  RAISE NOTICE 'Profile deleted for user: %', OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for avatar cleanup
DROP TRIGGER IF EXISTS cleanup_avatar_trigger ON public.profiles;
CREATE TRIGGER cleanup_avatar_trigger
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_avatar_on_profile_delete();

-- Update the handle_new_user function to include avatar_url from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Avatar support functions created successfully' as status;
