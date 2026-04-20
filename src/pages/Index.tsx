// Home page — hero + product grid with category filter, search & sort.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import logo from "@/assets/unistyle-logo.png";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  images: string[] | null;
  created_at: string;
};

const CATEGORIES = ["all", "men", "women", "accessories"] as const;
type Category = typeof CATEGORIES[number];
type Sort = "newest" | "price-asc" | "price-desc" | "name";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "UniStyle — Unisex Clothing & Accessories";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("products").select("*");
      if (filter !== "all") query = query.eq("category", filter);
      const { data } = await query;
      setProducts((data as any) ?? []);
      setLoading(false);
    };
    load();
  }, [filter]);

  // Client-side search + sort so the UI feels instant
  const visible = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price-desc": list.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [products, search, sort]);

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center flex flex-col items-center">
          <img
            src={logo}
            alt="UniStyle — E-commerce Hub"
            className="h-40 md:h-56 w-auto mb-8 drop-shadow-[0_8px_24px_hsl(var(--primary)/0.25)]"
          />
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unisex clothing & accessories. Simple. Timeless. For everyone.
          </p>
        </div>
      </section>

      {/* Search + sort + filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-3 mb-6 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
        ) : visible.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
