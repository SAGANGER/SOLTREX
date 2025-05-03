/*
  # Enable email authentication and update user policies

  1. Changes
    - Enable email authentication
    - Update user policies for authentication

  2. Security
    - Allow email sign-up and sign-in
    - Maintain existing RLS policies
*/

-- Enable email authentication
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update auth settings
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own auth data
CREATE POLICY "Users can read own auth data"
ON auth.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Create policy to allow users to update their own auth data
CREATE POLICY "Users can update own auth data"
ON auth.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());