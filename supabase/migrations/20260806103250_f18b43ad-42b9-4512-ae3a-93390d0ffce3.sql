-- 1) Storage: owner-only read of menu-media, matching the write policies
DROP POLICY IF EXISTS "owner read menu media" ON storage.objects;
CREATE POLICY "owner read menu media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'menu-media'
  AND EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.owner_id = auth.uid()
      AND r.id::text = (storage.foldername(storage.objects.name))[1]
  )
);

-- 2) Restaurants: remove blanket public read of all rows/columns
DROP POLICY IF EXISTS "public read restaurants" ON public.restaurants;

CREATE POLICY "owner read restaurants"
ON public.restaurants FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

-- Public menu access: one restaurant by slug, safe columns only
CREATE OR REPLACE FUNCTION public.get_public_restaurant(p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo text,
  cover text,
  phone text,
  address text,
  whatsapp text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.name, r.slug, r.logo, r.cover, r.phone, r.address, r.whatsapp
  FROM public.restaurants r
  WHERE r.slug = p_slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_restaurant(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_restaurant(text) TO anon, authenticated;