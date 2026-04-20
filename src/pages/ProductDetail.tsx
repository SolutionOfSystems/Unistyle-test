// Single product page — image, description, price, Add to Cart.
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      setProduct(data);
      if (data) document.title = `${data.name} — UniStyle`;
      setLoading(false);
    };
    load();
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      toast({ title: "Please login", description: "You need an account to add items to your cart." });
      navigate("/auth");
      return;
    }
    if (!product) return;
    setAdding(true);

    // Check if item already in cart -> increase quantity. Otherwise insert new row.
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 });
    }

    toast({ title: "Added to cart!", description: product.name });
    setAdding(false);
  };

  if (loading) return <p className="container mx-auto p-8 text-center text-muted-foreground">Loading...</p>;
  if (!product) return <p className="container mx-auto p-8 text-center">Product not found.</p>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold mb-6">₹{Number(product.price).toFixed(2)}</p>
          <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>
          <Button size="lg" onClick={addToCart} disabled={adding} className="w-full md:w-auto">
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </main>
  );
}
