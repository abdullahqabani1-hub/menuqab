import { supabase } from "@/integrations/supabase/client";

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const { data } = supabase.storage
    .from("menu-media")
    .getPublicUrl(path);

  return data.publicUrl;
}
export async function uploadMedia(
  restaurantId: string,
  folder: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${restaurantId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("menu-media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("ar").format(price)} ل.س`;
}