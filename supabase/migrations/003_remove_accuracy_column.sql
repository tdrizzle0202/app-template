-- Remove accuracy column from height_results table
ALTER TABLE height_results DROP COLUMN IF EXISTS accuracy;
