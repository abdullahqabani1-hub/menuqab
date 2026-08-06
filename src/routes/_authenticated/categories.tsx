import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRestaurant, useCategories, type Category } from "@/hooks/use-restaurant";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <DashboardShell title="التصنيفات" description="نظّم منيوك بتصنيفات واضحة">
      <CategoriesContent />
    </DashboardShell>
  );
}

function CategoriesContent() {
  const { data: restaurant } = useRestaurant();
  const { data: categories = [] } = useCategories(restaurant?.id);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["categories", restaurant?.id] });

  const save = useMutation({
    mutationFn: async () => {
      const value = name.trim();
      if (!value) throw new Error("أدخل اسم التصنيف");
      if (editing) {
        const { error } = await supabase
          .from("categories")
          .update({ name: value })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("categories")
          .insert({ restaurant_id: restaurant!.id, name: value, sort_order: categories.length });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "تم تعديل التصنيف" : "تمت إضافة التصنيف");
      setName("");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف التصنيف");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant sm:flex-row"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: وجبات، مشروبات، حلويات، أراكيل، مقبلات"
          maxLength={60}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending} className="gap-2">
            <Plus className="size-4" />
            {editing ? "حفظ التعديل" : "إضافة"}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setName("");
              }}
            >
              إلغاء
            </Button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد تصنيفات بعد.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="truncate font-medium">{c.name}</span>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="تعديل"
                  onClick={() => {
                    setEditing(c);
                    setName(c.name);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="حذف"
                  onClick={() => {
                    if (confirm(`حذف تصنيف "${c.name}"؟`)) remove.mutate(c.id);
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
