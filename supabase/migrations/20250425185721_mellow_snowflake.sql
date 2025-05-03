/*
  # Add INSERT policy for users table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own user record
    - Policy ensures wallet_address matches the authenticated user
*/

CREATE POLICY "Users can insert own data" 
ON users 
FOR INSERT 
TO public
WITH CHECK (wallet_address = CURRENT_USER);