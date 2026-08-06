CREATE OR REPLACE FUNCTION public.get_public_restaurant(p_slug text)
 RETURNS TABLE(id uuid, name text, slug text, logo text, cover text, phone text, address text, whatsapp text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT r.id, r.name, r.slug, r.logo, r.cover, r.phone, r.address, r.whatsapp
  FROM public.restaurants r
  WHERE lower(r.slug) = lower(btrim(p_slug))
  LIMIT 1;
$function$;