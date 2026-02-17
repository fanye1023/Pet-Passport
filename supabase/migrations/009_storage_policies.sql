-- Storage Bucket Policies
-- Ensures users can only access their own uploaded files

-- ============================================
-- CREATE BUCKETS (if not exists)
-- Note: Buckets may already exist from manual creation
-- ============================================

-- pet-photos bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  true,  -- Public bucket for pet profile photos (visible in share links)
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- pet-documents bucket (private, authenticated access only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-documents',
  'pet-documents',
  false,  -- Private bucket for sensitive documents
  10485760,  -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- ============================================
-- PET-PHOTOS BUCKET POLICIES
-- Path structure: {user_id}/{pet_id}/{filename}
-- ============================================

-- Allow authenticated users to upload photos to their own folder
CREATE POLICY "Users can upload own pet photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update own pet photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'pet-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete own pet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access for pet photos (needed for share links and profile display)
CREATE POLICY "Anyone can view pet photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-photos');

-- ============================================
-- PET-DOCUMENTS BUCKET POLICIES
-- Path structure: {user_id}/{pet_id}/{folder}/{filename}
-- ============================================

-- Allow authenticated users to upload documents to their own folder
CREATE POLICY "Users can upload own pet documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own documents
CREATE POLICY "Users can read own pet documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own documents
CREATE POLICY "Users can update own pet documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete own pet documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- COLLABORATOR ACCESS FOR DOCUMENTS
-- Allows collaborators to view documents for pets they have access to
-- Uses the pet_id from the path and checks pet_collaborators table
-- ============================================

-- Allow collaborators to read documents for shared pets
CREATE POLICY "Collaborators can read shared pet documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pet-documents' AND
  -- Extract pet_id from path (second folder in path)
  EXISTS (
    SELECT 1 FROM pet_collaborators pc
    WHERE pc.user_id = auth.uid()
    AND pc.pet_id::text = (storage.foldername(name))[2]
  )
);
