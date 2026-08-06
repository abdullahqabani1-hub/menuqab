import { createFileRoute, Link } from "@tanstack/react-router";
import { Tags, UtensilsCrossed, Clock } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRestaurant, useCategories, useProducts } from "@/hooks/use-restaurant";
import { mediaUrl, formatPrice } from "@/lib/media";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <DashboardShell title="لوحة التحكم" description="نظرة سريعة على منيو مطعمك">
      <DashboardContent />
    </DashboardShell>
  );
}

function DashboardContent() {
  const { data: restaurant } = useRestaurant();
  const { data: categories = [] } = useCategories(restaurant?.id);
  const { data: products = [] } = useProducts(restaurant?.id);

  const latest = products.slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Tags} label="عدد التصنيفات" value={categories.length} />
        <StatCard icon={UtensilsCrossed} label="عدد الأصناف" value={products.length} />
        <StatCard icon={Clock} label="آخر تحديث" value={latest.length ? "اليوم" : "—"} />
      </div>

      <section className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg">آخر الأصناف المضافة</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/products">إدارة الأصناف</Link>
          </Button>
        </div>
        {latest.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد أصناف بعد. ابدأ بإضافة أول صنف.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {mediaUrl(p.image) && (
                    <img
                      src={mediaUrl(p.image)!}
                      alt={p.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-primary">{formatPrice(Number(p.price))}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant">
      <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
