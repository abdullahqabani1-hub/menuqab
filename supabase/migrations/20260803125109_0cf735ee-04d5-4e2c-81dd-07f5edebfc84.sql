CREATE POLICY "owner upload menu media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'menu-media' AND EXISTS (
  SELECT 1 FROM public.restaurants r WHERE r.owner_id = auth.uid() AND r.id::text = (storage.foldername(name))[1]
));
CREATE POLICY "owner update menu media" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'menu-media' AND EXISTS (
  SELECT 1 FROM public.restaurants r WHERE r.owner_id = auth.uid() AND r.id::text = (storage.foldername(name))[1]
));
CREATE POLICY "owner delete menu media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'menu-media' AND EXISTS (
  SELECT 1 FROM public.restaurants r WHERE r.owner_id = auth.uid() AND r.id::text = (storage.foldername(name))[1]
));
CREATE POLICY "owner read menu media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'menu-media');