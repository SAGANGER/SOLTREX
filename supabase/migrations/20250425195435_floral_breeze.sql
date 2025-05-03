/*
  # Fix storage configuration

  1. Changes
    - Ensure storage extension is enabled
    - Recreate avatars bucket with correct settings
    - Set up proper RLS policies
    
  2. Security
    - Enable public read access
    - Restrict write operations to authenticated users
*/

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "storage";

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "avatar_select" ON storage.objects;
DROP POLICY IF EXISTS "avatar_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatar_update" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete" ON storage.objects;

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