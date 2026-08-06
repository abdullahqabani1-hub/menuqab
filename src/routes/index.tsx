import { createFileRoute, Link } from "@tanstack/react-router";
import { QrCode, LayoutGrid, ImageIcon, Languages, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => {
    const title = "MenuQab | منيو QR إلكتروني للمطاعم والمقاهي";
    const description =
      "أنشئ منيو مطعمك الإلكتروني برمز QR خلال دقائق: تصنيفات، أصناف بالصور والأسعار، ولوحة تحكم عربية بالكامل.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Landing,
});

const features = [
  { icon: QrCode, title: "رمز QR جاهز", text: "رمز خاص بمطعمك قابل للتحميل والطباعة فوراً." },
  { icon: LayoutGrid, title: "تصنيفات مرنة", text: "رتّب الأصناف ضمن تصنيفات واضحة يسهل تصفحها." },
  { icon: ImageIcon, title: "صور احترافية", text: "أضف صورة لكل صنف لتزيد شهية زبائنك." },
  { icon: Languages, title: "عربي بالكامل", text: "واجهة RTL مصممة للغة العربية من الأساس." },
  { icon: ShieldCheck, title: "بياناتك محمية", text: "كل مطعم يرى ويعدّل بياناته فقط." },
  { icon: Smartphone, title: "يعمل على كل جهاز", text: "منيو سريع ومتجاوب مع شاشات الهواتف." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Link to="/" className="text-2xl font-bold text-gradient-gold">
          MenuQab
        </Link>
        <Link to="/auth">
          <Button variant="outline">تسجيل الدخول</Button>
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-16 pt-14 text-center">
        <span className="inline-block rounded-full border border-border px-4 py-1 text-xs text-muted-foreground">
          منصّة المنيو الإلكتروني للمطاعم والمقاهي
        </span>
        <h1 className="mt-6 text-4xl leading-tight sm:text-5xl">
          <span className="text-gradient-gold">منيو مطعمك</span> برمز QR خلال دقائق
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          أنشئ منيو أنيقاً بالصور والأسعار، وشاركه مع زبائنك عبر رمز QR واحد. بدون تطبيقات، وبدون
          طباعة جديدة عند كل تغيير.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/auth">
            <Button size="lg">ابدأ مجاناً</Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="ghost">
              تعرّف على المزايا
            </Button>
          </a>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-8 px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant"
            >
              <f.icon className="size-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MenuQab — منصّة المنيو الإلكتروني
      </footer>
    </div>
  );
}
