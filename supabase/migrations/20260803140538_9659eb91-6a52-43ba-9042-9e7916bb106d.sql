GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.restaurants TO anon;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.restaurants TO service_role;

DROP POLICY IF EXISTS "owner read menu media" ON storage.objects;
DROP POLICY IF EXISTS "owner upload menu media" ON storage.objects;
DROP POLICY IF EXISTS "owner update menu media" ON storage.objects;
DROP POLICY IF EXISTS "owner delete menu media" ON storage.objects;

CREATE POLICY "owner read menu media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'menu-media' AND EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.owner_id = auth.uid() AND r.id::text = (storage.foldername(storage.objects.name))[1]));

CREATE POLICY "owner upload menu media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'menu-media' AND EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.owner_id = auth.uid() AND r.id::text = (storage.foldername(storage.objects.name))[1]));

CREATE POLICY "owner update menu media" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'menu-media' AND EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.owner_id = auth.uid() AND r.id::text = (storage.foldername(storage.objects.name))[1]))
WITH CHECK (bucket_id = 'menu-media' AND EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.owner_id = auth.uid() AND r.id::text = (storage.foldername(storage.objects.name))[1]));

CREATE POLICY "owner delete menu media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'menu-media' AND EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.owner_id = auth.uid() AND r.id::text = (storage.foldername(storage.objects.name))[1]));