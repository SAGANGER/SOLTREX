/*
  # Fix user registration policies

  1. Changes
    - Drop existing policies
    - Create new policy for user registration
    - Ensure public can insert into users table

  2. Security
    - Allow public registration without requiring authentication
    - Maintain data integrity with proper constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Create new policy for user registration
CREATE POLICY "Allow public registration"
ON users
FOR INSERT
TO public
WITH CHECK (true);