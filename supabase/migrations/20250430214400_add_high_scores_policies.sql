-- Enable RLS on high_scores table
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for leaderboard)
CREATE POLICY "Public can read high scores"
ON high_scores
FOR SELECT
TO public
USING (true);

-- Create policy for authenticated users to update their own high score
CREATE POLICY "Users can update own high score"
ON high_scores
FOR UPDATE
TO authenticated
USING (wallet_address = auth.uid()::text)
WITH CHECK (wallet_address = auth.uid()::text);

-- Create policy for authenticated users to insert their high score
CREATE POLICY "Users can insert own high score"
ON high_scores
FOR INSERT
TO authenticated
WITH CHECK (wallet_address = auth.uid()::text); 