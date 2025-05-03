-- Create high_scores table
CREATE TABLE IF NOT EXISTS high_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(wallet_address)
);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS high_scores_score_idx ON high_scores(score DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_high_scores_updated_at
    BEFORE UPDATE ON high_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 