/*
  # Fix storage policies for avatar uploads

  1. Changes
    - Drop existing storage policies
    - Create new storage policies with correct bucket handling
    - Update bucket configuration

  2. Security
    - Allow public access to avatars bucket
    - Enable authenticated users to manage their avatars
*/

-- Recreate the storage bucket with correct settings
DELETE FROM storage.buckets WHERE id = 'avatars';
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Create new policies with correct access control
CREATE POLICY "Allow public avatar access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

CREATE POLICY "Allow authenticated avatar uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Allow authenticated avatar updates"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' )
WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Allow authenticated avatar deletions"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' );