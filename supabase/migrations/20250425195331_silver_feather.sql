/*
  # Fix avatar storage configuration

  1. Changes
    - Drop all existing storage policies
    - Recreate bucket with correct settings
    - Set up proper RLS policies
    
  2. Security
    - Enable public read access
    - Restrict write operations to authenticated users
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own avatars" ON storage.objects;

-- Recreate bucket with correct settings
DELETE FROM storage.buckets WHERE id = 'avatars';
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "avatar_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "avatar_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatar_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "avatar_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');