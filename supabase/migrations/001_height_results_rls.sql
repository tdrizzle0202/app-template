-- Enable RLS on height_results table
ALTER TABLE height_results ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything (for Edge Functions)
CREATE POLICY "Service role can manage all height_results" ON height_results
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Allow authenticated users to insert their own records
CREATE POLICY "Users can insert their own height_results" ON height_results
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Allow authenticated users to view their own records
CREATE POLICY "Users can view their own height_results" ON height_results
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Allow authenticated users to update their own records
CREATE POLICY "Users can update their own height_results" ON height_results
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy: Allow authenticated users to delete their own records
CREATE POLICY "Users can delete their own height_results" ON height_results
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Add user_id column to track ownership (if not exists)
ALTER TABLE height_results ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing records to have a user_id (optional, for existing data)
-- UPDATE height_results SET user_id = auth.uid() WHERE user_id IS NULL;

-- Update policies to use user_id for ownership
DROP POLICY IF EXISTS "Users can view their own height_results" ON height_results;
DROP POLICY IF EXISTS "Users can update their own height_results" ON height_results;
DROP POLICY IF EXISTS "Users can delete their own height_results" ON height_results;

CREATE POLICY "Users can view their own height_results" ON height_results
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own height_results" ON height_results
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own height_results" ON height_results
  FOR DELETE USING (user_id = auth.uid());

-- Update the insert policy to set user_id automatically
DROP POLICY IF EXISTS "Users can insert their own height_results" ON height_results;
CREATE POLICY "Users can insert their own height_results" ON height_results
  FOR INSERT WITH CHECK (user_id = auth.uid());