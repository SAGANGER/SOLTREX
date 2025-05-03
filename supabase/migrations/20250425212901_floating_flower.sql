/*
  # Fix registration flow and policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies for registration
    - Add proper constraints
    
  2. Security
    - Allow public registration
    - Maintain data integrity
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public registration and read" ON users;

-- Create new simplified policies
CREATE POLICY "users_public_access"
ON users
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure the table has the correct constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_wallet_address_key;
ALTER TABLE users ADD CONSTRAINT users_wallet_address_key UNIQUE (wallet_address);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;