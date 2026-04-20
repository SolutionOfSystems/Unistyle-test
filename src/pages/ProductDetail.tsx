// Single product page — image gallery, description, price, stock, Add to Cart.
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
  images: string[] | null;
  stock: number;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      setProduct(data as any);
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
    if (product.stock <= 0) {
      toast({ title: "Out of stock", description: "This item is currently unavailable.", variant: "destructive" });
      return;
    }
    setAdding(true);

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        toast({ title: "Stock limit", description: `Only ${product.stock} in stock.`, variant: "destructive" });
        setAdding(false);
        return;
      }
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 });
    }

    toast({ title: "Added to cart!", description: product.name });
    setAdding(false);
  };

  if (loading) return <p className="container mx-auto p-8 text-center text-muted-foreground">Loading...</p>;
  if (!product) return <p className="container mx-auto p-8 text-center">Product not found.</p>;

  // Build gallery: prefer images[] array, fallback to single image_url, then placeholder
  const gallery: string[] =
    (product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : ["/placeholder.svg"]);
  const outOfStock = product.stock <= 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div>
          <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
            <img src={gallery[activeImg]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition ${
                    activeImg === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold mb-4">₹{Number(product.price).toFixed(2)}</p>
          <div className="mb-6">
            {outOfStock ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="secondary">Only {product.stock} left in stock</Badge>
            ) : (
              <Badge variant="secondary">In stock</Badge>
            )}
          </div>
          <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>
          <Button size="lg" onClick={addToCart} disabled={adding || outOfStock} className="w-full md:w-auto">
            {outOfStock ? "Out of stock" : adding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </main>
  );
}
