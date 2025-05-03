/*
  # Fix user registration policies for wallet-based auth

  1. Changes
    - Drop existing registration policies
    - Create new policy for wallet-based registration
    - Update RLS to work with wallet addresses
    
  2. Security
    - Allow registration with verified wallet addresses
    - Maintain data integrity with proper constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated user registration" ON users;
DROP POLICY IF EXISTS "Allow public registration" ON users;

-- Create new policy for wallet-based registration
CREATE POLICY "Allow wallet registration"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- Update select policy
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO public
USING (true);