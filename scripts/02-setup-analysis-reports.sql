-- Create analysis_reports table
CREATE TABLE IF NOT EXISTS public.analysis_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT DEFAULT 'unknown',
  file_size INTEGER DEFAULT 0,
  analysis_results JSONB NOT NULL,
  plagiarism_score DECIMAL(5,4) DEFAULT 0,
  forgery_detected BOOLEAN DEFAULT FALSE,
  privacy_issues_count INTEGER DEFAULT 0,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'LOW',
  report_html TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own reports" ON public.analysis_reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.analysis_reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.analysis_reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.analysis_reports;
DROP POLICY IF EXISTS "Enable read access for own reports" ON public.analysis_reports;
DROP POLICY IF EXISTS "Enable update for own reports" ON public.analysis_reports;

-- Create RLS policies for analysis_reports
CREATE POLICY "Enable insert for authenticated users only" ON public.analysis_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own reports" ON public.analysis_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own reports" ON public.analysis_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analysis_reports_user_id ON public.analysis_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_created_at ON public.analysis_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_risk_level ON public.analysis_reports(risk_level);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.analysis_reports;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.analysis_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

SELECT 'Analysis reports table created successfully' as status;
