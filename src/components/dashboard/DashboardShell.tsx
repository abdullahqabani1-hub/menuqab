import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Tags,
  UtensilsCrossed,
  Settings,
  QrCode,
  LogOut,
  Menu as MenuIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/use-restaurant";
import { slugify } from "@/lib/media";

const NAV = [
  { to: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/categories", label: "التصنيفات", icon: Tags },
  { to: "/products", label: "الأصناف", icon: UtensilsCrossed },
  { to: "/qr", label: "رمز QR", icon: QrCode },
  { to: "/settings", label: "الإعدادات", icon: Settings },
] as const;

function Onboarding({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("جلسة غير صالحة");
      const finalSlug = slugify(slug || name) || `menu-${Date.now()}`;
      const { error } = await supabase
        .from("restaurants")
        .insert({ owner_id: uid, name: name.trim(), slug: finalSlug });
      if (error) throw error;
      toast.success("تم إنشاء المطعم بنجاح");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر إنشاء المطعم");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={submit}
        className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-elegant"
      >
        <h1 className="text-2xl text-gradient-gold">أهلاً بك في MenuQab</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          أنشئ مطعمك للبدء بإدارة المنيو الإلكتروني.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rname">اسم المطعم</Label>
            <Input
              id="rname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مطعم الشام"
              required
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rslug">الرابط المختصر (بالإنجليزية)</Label>
            <Input
              id="rslug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="alsham-restaurant"
              dir="ltr"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              سيكون رابط المنيو: /menu/{slugify(slug || name) || "..."}
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "جارٍ الإنشاء..." : "إنشاء المطعم"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { data: restaurant, isLoading, refetch } = useRestaurant();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!restaurant)
    return (
      <Onboarding
        onDone={async () => {
          await queryClient.invalidateQueries({ queryKey: ["restaurant"] });
          await refetch();
          navigate({ to: "/dashboard" });
        }}
      />
    );


  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
              active
                ? "bg-gradient-gold font-semibold text-primary-foreground shadow-gold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-border bg-sidebar p-5 lg:flex">
          <Link to="/" className="mb-8 text-2xl font-bold text-gradient-gold">
            MenuQab
          </Link>
          {nav}
          <div className="mt-auto space-y-2">
            <Link
              to="/menu/$slug"
              params={{ slug: restaurant.slug }}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-4" />
              عرض المنيو
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
              <LogOut className="size-4" />
              تسجيل الخروج
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-5 lg:p-8">
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-xl font-bold text-gradient-gold lg:hidden">
                MenuQab
              </div>
              <h1 className="text-2xl lg:text-3xl">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="القائمة"
            >
              <MenuIcon className="size-4" />
            </Button>
          </header>

          {open && (
            <div className="mb-6 rounded-2xl border border-border bg-sidebar p-4 lg:hidden">
              {nav}
              <Button variant="ghost" className="mt-2 w-full justify-start gap-2" onClick={signOut}>
                <LogOut className="size-4" />
                تسجيل الخروج
              </Button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
