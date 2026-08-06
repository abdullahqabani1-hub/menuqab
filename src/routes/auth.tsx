import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { QrCode, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | MenuQab" },
      { name: "description", content: "سجّل الدخول إلى لوحة تحكم مطعمك على MenuQab وأدر منيوك الإلكتروني." },
      { property: "og:title", content: "تسجيل الدخول | MenuQab" },
      { property: "og:description", content: "لوحة تحكم المنيو الإلكتروني للمطاعم والكافيهات." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (/confirm/i.test(error.message)) {
            setPendingEmail(email);
            throw new Error("يجب تأكيد بريدك الإلكتروني قبل تسجيل الدخول");
          }
          throw error;
        }
        navigate({ to: "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/dashboard" });
        } else {
          setPendingEmail(email);
          toast.success("تم إرسال رابط التأكيد إلى بريدك الإلكتروني");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!pendingEmail) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    if (error) toast.error(error.message);
    else toast.success("تم إعادة إرسال رابط التأكيد");
  };

  const forgotPassword = async () => {
    if (!email) {
      toast.error("أدخل بريدك الإلكتروني أولاً");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("تعذّر تسجيل الدخول عبر Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };


  return (
    <div className="auth-blue relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[10%] -left-[10%] h-[50%] w-[80%] rounded-full bg-primary/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[50%] w-[80%] rounded-full bg-indigo-900/20 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-[390px]">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-700 to-blue-500 shadow-2xl shadow-primary/20">
            <QrCode className="size-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Menu<span className="text-primary">Qab</span>
          </h1>
          <p className="mt-2 text-xs font-light uppercase tracking-[0.2em] text-muted-foreground">
            Smart Menu Solutions
          </p>
        </div>

        <div className="auth-card rounded-[2.5rem] p-8">
          <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">
            {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </h2>

          {pendingEmail && (
            <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground/80">
              <p>
                أرسلنا رابط تأكيد إلى <span dir="ltr" className="font-semibold">{pendingEmail}</span>.
                فعّل حسابك من بريدك ثم سجّل الدخول.
              </p>
              <Button variant="ghost" size="sm" onClick={resend} className="mt-2 px-0 text-primary">
                إعادة إرسال رابط التأكيد
              </Button>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">


            <div className="space-y-2">
              <Label htmlFor="email" className="mr-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="auth-input h-auto rounded-2xl px-6 py-4 placeholder:text-foreground/20 focus:bg-foreground/[0.05] focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="mr-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input h-auto rounded-2xl px-6 py-4 placeholder:text-foreground/20 focus:bg-foreground/[0.05] focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="group mt-4 flex h-auto w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98] hover:from-primary/90 hover:to-primary/70"
            >
              <span>{loading ? "جارٍ المعالجة..." : mode === "signin" ? "دخول للمنصة" : "إنشاء الحساب"}</span>
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            </Button>
          </form>

          {mode === "signin" && (
            <button
              type="button"
              onClick={forgotPassword}
              className="mt-4 w-full text-center text-sm text-primary hover:underline"
            >
              نسيت كلمة المرور؟
            </button>
          )}


          <div className="my-8 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-l from-foreground/10 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">أو عبر</span>
            <div className="h-px flex-1 bg-gradient-to-r from-foreground/10 to-transparent" />
          </div>

          <Button
            variant="outline"
            onClick={google}
            className="h-auto w-full rounded-xl border-foreground/5 bg-foreground/[0.03] py-3 text-sm text-foreground/70 hover:bg-foreground/[0.08] hover:text-foreground"
          >
            المتابعة عبر Google
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-8 w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
          </button>
        </div>
      </div>
    </div>
  );
}
