-- Drop existing policies
DROP POLICY IF EXISTS "allow_all" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies
CREATE POLICY "public_read"
ON users
FOR SELECT
TO public
USING (true);

CREATE POLICY "authenticated_insert"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update"
ON users
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;