import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import QRCode from "qrcode";
import { Download, Printer, Copy } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRestaurant } from "@/hooks/use-restaurant";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/qr")({
  component: QrPage,
});

function QrPage() {
  return (
    <DashboardShell title="رمز QR" description="شارك منيوك مع الزبائن عبر مسح الرمز">
      <QrContent />
    </DashboardShell>
  );
}

function QrContent() {
  const { data: restaurant } = useRestaurant();
  const [dataUrl, setDataUrl] = useState("");
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    if (!restaurant) return;
    const url = `${window.location.origin}/menu/${restaurant.slug}`;
    setMenuUrl(url);
    QRCode.toDataURL(url, {
      width: 900,
      margin: 2,
      color: { dark: "#1a1713", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => toast.error("تعذّر إنشاء رمز QR"));
  }, [restaurant]);

  if (!restaurant) return null;

  const download = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `menuqab-${restaurant.slug}.png`;
    a.click();
  };

  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html dir="rtl"><head><title>${restaurant.name} - QR</title></head>
       <body style="font-family:sans-serif;text-align:center;padding:40px">
         <h1>${restaurant.name}</h1>
         <p>امسح الرمز لعرض المنيو</p>
         <img src="${dataUrl}" style="width:340px" />
         <p style="direction:ltr">${menuUrl}</p>
       </body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="max-w-md space-y-6 rounded-2xl border border-border bg-gradient-surface p-6 text-center shadow-elegant">
      {dataUrl && (
        <img
          src={dataUrl}
          alt={`رمز QR لمنيو ${restaurant.name}`}
          className="mx-auto w-64 rounded-2xl bg-white p-3"
        />
      )}
      <p dir="ltr" className="break-all text-sm text-muted-foreground">
        {menuUrl}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={download} className="gap-2" disabled={!dataUrl}>
          <Download className="size-4" /> تحميل
        </Button>
        <Button onClick={print} variant="outline" className="gap-2" disabled={!dataUrl}>
          <Printer className="size-4" /> طباعة
        </Button>
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => {
            navigator.clipboard.writeText(menuUrl);
            toast.success("تم نسخ الرابط");
          }}
        >
          <Copy className="size-4" /> نسخ الرابط
        </Button>
      </div>
    </div>
  );
}
