-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload menu images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'menu-images'
  AND auth.role() = 'authenticated'
);

-- Allow public access to view images
CREATE POLICY "Public can view menu images" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their menu images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'menu-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their menu images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'menu-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);