-- Drop problematic triggers and functions with CASCADE
DROP TRIGGER IF EXISTS check_referral_scores_trigger ON high_scores CASCADE;
DROP TRIGGER IF EXISTS update_referral_status ON high_scores CASCADE;
DROP FUNCTION IF EXISTS check_referral_scores() CASCADE;

-- Insert missing high score entries for existing users
INSERT INTO high_scores (wallet_address, score)
SELECT u.wallet_address, 0
FROM users u
LEFT JOIN high_scores hs ON u.wallet_address = hs.wallet_address
WHERE hs.wallet_address IS NULL; 