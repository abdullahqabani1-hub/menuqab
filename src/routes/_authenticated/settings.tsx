import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRestaurant } from "@/hooks/use-restaurant";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl, uploadMedia, slugify } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <DashboardShell title="الإعدادات" description="بيانات مطعمك وهويته البصرية">
      <SettingsContent />
    </DashboardShell>
  );
}

function SettingsContent() {
  const { data: restaurant } = useRestaurant();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!restaurant) return;
    setName(restaurant.name);
    setSlug(restaurant.slug);
    setPhone(restaurant.phone ?? "");
    setAddress(restaurant.address ?? "");
    setWhatsapp(restaurant.whatsapp ?? "");
  }, [restaurant]);

  if (!restaurant) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let logo = restaurant.logo;
      let cover = restaurant.cover;
      if (logoFile) logo = await uploadMedia(restaurant.id, "logo", logoFile);
      if (coverFile) cover = await uploadMedia(restaurant.id, "cover", coverFile);

      const { error } = await supabase
        .from("restaurants")
        .update({
          name: name.trim(),
          slug: slugify(slug) || restaurant.slug,
          phone: phone.trim() || null,
          address: address.trim() || null,
          whatsapp: whatsapp.trim() || null,
          logo,
          cover,
        })
        .eq("id", restaurant.id);
      if (error) throw error;
      toast.success("تم حفظ الإعدادات");
      setLogoFile(null);
      setCoverFile(null);
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-2xl space-y-6 rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">اسم المطعم</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">الرابط المختصر</Label>
          <Input
            id="slug"
            dir="ltr"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input id="phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">رقم واتساب</Label>
          <Input
            id="whatsapp"
            dir="ltr"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="9639xxxxxxxx"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">العنوان</Label>
        <Textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logo">شعار المطعم</Label>
          {mediaUrl(restaurant.logo) && (
            <img
              src={mediaUrl(restaurant.logo)!}
              alt="شعار المطعم"
              className="size-20 rounded-xl object-cover"
            />
          )}
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover">صورة الغلاف</Label>
          {mediaUrl(restaurant.cover) && (
            <img
              src={mediaUrl(restaurant.cover)!}
              alt="غلاف المطعم"
              className="h-20 w-full rounded-xl object-cover"
            />
          )}
          <Input
            id="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
