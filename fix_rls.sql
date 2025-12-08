-- Quick fix for RLS on height_results table
-- Run this in your Supabase SQL Editor

-- First, add user_id column if it doesn't exist
ALTER TABLE height_results ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage all height_results" ON height_results;
DROP POLICY IF EXISTS "Users can insert their own height_results" ON height_results;
DROP POLICY IF EXISTS "Users can view their own height_results" ON height_results;
DROP POLICY IF EXISTS "Users can update their own height_results" ON height_results;
DROP POLICY IF EXISTS "Users can delete their own height_results" ON height_results;

-- Create policy for service role (Edge Functions)
CREATE POLICY "Service role can manage all height_results" ON height_results
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for authenticated users
CREATE POLICY "Users can insert their own height_results" ON height_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own height_results" ON height_results
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own height_results" ON height_results
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own height_results" ON height_results
  FOR DELETE USING (user_id = auth.uid());

-- Enable anonymous authentication (if not already enabled)
-- You may need to enable this in your Supabase Auth settings instead