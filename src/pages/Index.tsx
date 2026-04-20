// Home page — hero + product grid with category filter.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
};

const CATEGORIES = ["all", "men", "women", "accessories"] as const;
type Category = typeof CATEGORIES[number];

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Category>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "UniStyle — Unisex Clothing & Accessories";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("category", filter);
      const { data } = await query;
      setProducts(data ?? []);
      setLoading(false);
    };
    load();
  }, [filter]);

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">UniStyle</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unisex clothing & accessories. Simple. Timeless. For everyone.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              variant={filter === c ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(c)}
              className="capitalize"
            >
              {c}
            </Button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
