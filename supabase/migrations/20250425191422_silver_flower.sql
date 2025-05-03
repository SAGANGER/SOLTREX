/*
  # Fix user registration RLS policy

  1. Changes
    - Update INSERT policy for users table to allow new user registration
    - Keep existing SELECT and UPDATE policies unchanged

  2. Security
    - Ensures users can only insert their own wallet address
    - Maintains existing RLS policies for other operations
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create new INSERT policy that allows registration
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Ensure the wallet_address being inserted matches the one being used
    auth.jwt() ->> 'sub' = wallet_address
  );