-- Drop existing policies
DROP POLICY IF EXISTS "allow_all" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create policy for user registration that allows any authenticated user to register
CREATE POLICY "Allow user registration"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (
  true  -- Temporarily allow reading all records for authenticated users
);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (wallet_address = auth.uid()::text)
WITH CHECK (wallet_address = auth.uid()::text);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;