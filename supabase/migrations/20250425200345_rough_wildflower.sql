/*
  # Fix user registration security

  1. Changes
    - Drop existing public registration policy
    - Create new policy for authenticated user registration
    - Add proper wallet address validation

  2. Security
    - Ensure users can only register with their own wallet address
    - Maintain data integrity with proper authentication checks
*/

-- Drop the existing policy that allows public registration
DROP POLICY IF EXISTS "Allow public registration" ON users;

-- Create new policy for authenticated user registration
CREATE POLICY "Allow authenticated user registration"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  -- Ensure the wallet_address matches the authenticated user's ID
  auth.uid()::text = wallet_address
);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;