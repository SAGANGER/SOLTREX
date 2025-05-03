-- Drop existing policies
DROP POLICY IF EXISTS "users_public_access" ON users;

-- Create new simplified policy
CREATE POLICY "allow_all"
ON users
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled but with public access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;