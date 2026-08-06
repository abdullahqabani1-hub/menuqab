import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Restaurant = Tables<"restaurants">;
export type Category = Tables<"categories">;
export type Product = Tables<"products">;

export function useRestaurant() {
  return useQuery({
    queryKey: ["restaurant"],
    queryFn: async (): Promise<Restaurant | null> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", uid)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCategories(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["categories", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProducts(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["products", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
