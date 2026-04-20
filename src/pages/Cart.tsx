// Cart page — list items in user's cart, update quantity, remove, checkout.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type CartRow = {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  } | null;
};

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Cart — UniStyle"; }, []);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("cart_items")
      .select("id, quantity, product_id, products(id, name, price, image_url)")
      .eq("user_id", user.id);
    setItems((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    load();
  };

  const total = items.reduce((sum, i) => sum + (i.products ? Number(i.products.price) * i.quantity : 0), 0);

  if (loading) return <p className="container mx-auto p-8 text-center text-muted-foreground">Loading cart...</p>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link to="/"><Button>Continue Shopping</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex gap-4 items-center">
                  <img
                    src={item.products?.image_url || "/placeholder.svg"}
                    alt={item.products?.name}
                    className="w-20 h-20 object-cover rounded bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.products?.name}</h3>
                    <p className="text-sm text-muted-foreground">₹{Number(item.products?.price ?? 0).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(Number(item.products?.price ?? 0) * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" onClick={() => remove(item.id)} className="mt-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
              </div>
              <Link to="/checkout"><Button size="lg">Checkout</Button></Link>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
