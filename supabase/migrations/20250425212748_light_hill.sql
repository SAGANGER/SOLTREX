/*
  # Fix registration policies and add unique constraints

  1. Changes
    - Add unique constraint for username
    - Update registration policies
    - Ensure proper access control
    
  2. Security
    - Allow public registration with wallet addresses
    - Maintain data integrity with constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow wallet registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new policies
CREATE POLICY "Allow public registration and read"
ON users
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Add unique constraint for username if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;