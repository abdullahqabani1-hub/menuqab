import { createFileRoute, notFound } from "@tanstack/react-router";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl, formatPrice } from "@/lib/media";

type MenuData = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    cover: string | null;
    phone: string | null;
    address: string | null;
    whatsapp: string | null;
  };
  categories: { id: string; name: string }[];
  products: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    category_id: string | null;
  }[];
};

async function loadMenu(slug: string): Promise<MenuData> {
  const { data, error } = await supabase.rpc("get_public_restaurant", { p_slug: slug });
  if (error) throw error;
  const restaurant = data?.[0];
  if (!restaurant) throw notFound();


  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, description, price, image, category_id")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    restaurant,
    categories: categories ?? [],
    products: (products ?? []).map((p) => ({ ...p, price: Number(p.price) })),
  };
}

export const Route = createFileRoute("/menu/$slug")({
  loader: ({ params }) => loadMenu(params.slug),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "المنيو غير متاح | MenuQab" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `منيو ${loaderData.restaurant.name} | MenuQab`;
    const description = `تصفح منيو ${loaderData.restaurant.name} الإلكتروني: الأصناف والأسعار والصور.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: MenuPage,
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      تعذّر تحميل المنيو
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      هذا المنيو غير موجود
    </div>
  ),
});

function MenuPage() {
  const { restaurant, categories, products } = Route.useLoaderData() as MenuData;
  const uncategorized = products.filter((p) => !p.category_id);

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="relative">
        <div className="h-52 w-full overflow-hidden bg-gradient-surface sm:h-72">
          {mediaUrl(restaurant.cover) && (
            <img
              src={mediaUrl(restaurant.cover)!}
              alt={`غلاف ${restaurant.name}`}
              className="size-full object-cover"
            />
          )}
        </div>
        <div className="mx-auto -mt-14 max-w-3xl px-4 text-center">
          <div className="mx-auto size-28 overflow-hidden rounded-2xl border-4 border-background bg-card shadow-elegant">
            {mediaUrl(restaurant.logo) ? (
              <img
                src={mediaUrl(restaurant.logo)!}
                alt={`شعار ${restaurant.name}`}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-2xl text-gradient-gold">
                {restaurant.name.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="mt-4 text-3xl text-gradient-gold">{restaurant.name}</h1>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1.5">
                <Phone className="size-4" /> {restaurant.phone}
              </a>
            )}
            {restaurant.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {restaurant.address}
              </span>
            )}
            {restaurant.whatsapp && (
              <a
                href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-primary"
              >
                <MessageCircle className="size-4" /> واتساب
              </a>
            )}
          </div>
        </div>
      </header>

      {categories.length > 0 && (
        <nav className="sticky top-0 z-10 mt-8 border-y border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className="shrink-0 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary"
              >
                {c.name}
              </a>
            ))}
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-3xl space-y-10 px-4 pt-8">
        {categories.map((c) => {
          const items = products.filter((p) => p.category_id === c.id);
          if (items.length === 0) return null;
          return <Section key={c.id} id={`cat-${c.id}`} title={c.name} items={items} />;
        })}
        {uncategorized.length > 0 && (
          <Section id="cat-other" title="أصناف أخرى" items={uncategorized} />
        )}
        {products.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            لم تتم إضافة أصناف إلى هذا المنيو بعد.
          </p>
        )}
      </main>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        صُنع بواسطة <span className="text-gradient-gold">MenuQab</span>
      </footer>
    </div>
  );
}

function Section({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: MenuData["products"];
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-4 text-xl text-gradient-gold">{title}</h2>
      <ul className="space-y-3">
        {items.map((p) => (
          <li
            key={p.id}
            className="flex gap-4 rounded-2xl border border-border bg-gradient-surface p-3 shadow-elegant"
          >
            <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
              {mediaUrl(p.image) && (
                <img
                  src={mediaUrl(p.image)!}
                  alt={p.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">{p.name}</h3>
                <span className="shrink-0 font-bold text-primary">{formatPrice(p.price)}</span>
              </div>
              {p.description && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
