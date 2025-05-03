-- Drop existing policies
DROP POLICY IF EXISTS "allow_all" ON users;

-- Create policy for user registration
CREATE POLICY "Allow user registration"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated' AND wallet_address IS NOT NULL
);

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (
  wallet_address = auth.uid()::text
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
