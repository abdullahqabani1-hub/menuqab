import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "إعادة تعيين كلمة المرور | MenuQab" },
      {
        name: "description",
        content: "أنشئ كلمة مرور جديدة لحسابك على منصة MenuQab لإدارة المنيو الإلكتروني.",
      },
      { property: "og:title", content: "إعادة تعيين كلمة المرور | MenuQab" },
      { property: "og:description", content: "أنشئ كلمة مرور جديدة لحساب مطعمك على MenuQab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("تم تحديث كلمة المرور");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر تحديث كلمة المرور");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-blue flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="auth-card w-full max-w-md rounded-[2rem] p-8">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">كلمة مرور جديدة</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {ready
            ? "أدخل كلمة المرور الجديدة لحسابك."
            : "افتح هذه الصفحة من رابط إعادة التعيين المرسل إلى بريدك."}
        </p>
        <div className="space-y-2">
          <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
          <Input
            id="new-password"
            type="password"
            dir="ltr"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input h-auto rounded-2xl px-6 py-4"
          />
        </div>
        <Button type="submit" disabled={saving || !ready} className="mt-6 w-full rounded-2xl py-4">
          {saving ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
        </Button>
      </form>
    </div>
  );
}
