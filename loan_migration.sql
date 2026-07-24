CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  solution_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  duration_months INTEGER NOT NULL,
  employment_status TEXT NOT NULL,
  monthly_income NUMERIC NOT NULL,
  monthly_expenses NUMERIC NOT NULL,
  documents JSONB DEFAULT '[]'::JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- Policies for loan_applications
-- Normally we would use auth.uid(), but since we are handling auth via our own token/profile for now (client-side MVP), we'll allow anon to insert, but only select their own if we had proper JWT. For MVP without Supabase Auth session, we'll open it to anon insertion and reading.
CREATE POLICY "Enable insert for anon" ON loan_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for anon" ON loan_applications FOR SELECT USING (true);
CREATE POLICY "Enable update for anon" ON loan_applications FOR UPDATE USING (true);
