import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ImagePlus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  useRestaurant,
  useCategories,
  useProducts,
  type Product,
} from "@/hooks/use-restaurant";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl, uploadMedia, formatPrice } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <DashboardShell title="الأصناف" description="أضف وعدّل أصناف المنيو وصورها">
      <ProductsContent />
    </DashboardShell>
  );
}

const NO_CATEGORY = "none";

function ProductsContent() {
  const { data: restaurant } = useRestaurant();
  const { data: categories = [] } = useCategories(restaurant?.id);
  const { data: products = [] } = useProducts(restaurant?.id);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["products", restaurant?.id] });

  const reset = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId(NO_CATEGORY);
    setFile(null);
  };

  const openNew = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setDescription(p.description ?? "");
    setPrice(String(p.price));
    setCategoryId(p.category_id ?? NO_CATEGORY);
    setFile(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setSaving(true);
    try {
      let image = editing?.image ?? null;
      if (file) image = await uploadMedia(restaurant.id, "products", file);

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price) || 0,
        category_id: categoryId === NO_CATEGORY ? null : categoryId,
        image,
      };

      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert({ ...payload, restaurant_id: restaurant.id });
        if (error) throw error;
      }
      toast.success(editing ? "تم تعديل الصنف" : "تمت إضافة الصنف");
      setOpen(false);
      reset();
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف الصنف");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : (setOpen(false), reset()))}>
        <DialogTrigger asChild>
          <Button className="gap-2" onClick={openNew}>
            <Plus className="size-4" />
            صنف جديد
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل صنف" : "إضافة صنف"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pname">الاسم</Label>
              <Input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdesc">الوصف</Label>
              <Textarea
                id="pdesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={400}
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pprice">السعر</Label>
                <Input
                  id="pprice"
                  type="number"
                  min="0"
                  step="0.01"
                  dir="ltr"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر تصنيفاً" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY}>بدون تصنيف</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pimg" className="flex items-center gap-2">
                <ImagePlus className="size-4" /> صورة الصنف
              </Label>
              <Input
                id="pimg"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد أصناف بعد.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
            >
              <div className="aspect-[4/3] bg-secondary">
                {mediaUrl(p.image) && (
                  <img
                    src={mediaUrl(p.image)!}
                    alt={p.name}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-base font-semibold">{p.name}</h3>
                  <span className="shrink-0 text-primary">{formatPrice(Number(p.price))}</span>
                </div>
                {p.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                )}
                <div className="flex gap-1 pt-1">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(p)}>
                    <Pencil className="size-3.5" /> تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-destructive"
                    onClick={() => {
                      if (confirm(`حذف "${p.name}"؟`)) remove.mutate(p.id);
                    }}
                  >
                    <Trash2 className="size-3.5" /> حذف
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
