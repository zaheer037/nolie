-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS analysis_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT DEFAULT 'unknown',
  file_size INTEGER DEFAULT 0,
  analysis_results JSONB NOT NULL,
  plagiarism_score DECIMAL(3,2) DEFAULT 0,
  forgery_detected BOOLEAN DEFAULT FALSE,
  privacy_issues_count INTEGER DEFAULT 0,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'LOW',
  report_html TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own reports" ON analysis_reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON analysis_reports;
DROP POLICY IF EXISTS "Users can update own reports" ON analysis_reports;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for analysis_reports
CREATE POLICY "Users can view own reports" ON analysis_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON analysis_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON analysis_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_reports_user_id ON analysis_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_created_at ON analysis_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_risk_level ON analysis_reports(risk_level);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analysis_reports_updated_at ON analysis_reports;
CREATE TRIGGER update_analysis_reports_updated_at
    BEFORE UPDATE ON analysis_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
