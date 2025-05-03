/*
  # Create users table for registration

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique)
      - `username` (text, unique, optional)
      - `avatar_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for users to update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE,
  avatar_url text DEFAULT 'default.png',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (wallet_address = current_user);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (wallet_address = current_user)
  WITH CHECK (wallet_address = current_user);