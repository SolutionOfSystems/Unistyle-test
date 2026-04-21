// Checkout page — collects shipping info, places COD order, then clears cart.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type CartRow = {
  id: string;
  quantity: number;
  product_id: string;
  products: { id: string; name: string; price: number; image_url: string | null } | null;
};

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartRow[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Checkout — UniStyle"; }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("cart_items")
        .select("id, quantity, product_id, products(id, name, price, image_url)")
        .eq("user_id", user.id);
      setItems((data as any) ?? []);
    };
    load();
  }, [user]);

  const total = items.reduce((s, i) => s + (i.products ? Number(i.products.price) * i.quantity : 0), 0);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setBusy(true);

    try {
      // 1) Create the order row
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          shipping_name: name,
          shipping_address: address,
          status: "Pending",
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      // 2) Insert each cart item as an order_item (snapshot of product info)
      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.products?.price ?? 0,
        product_name: i.products?.name ?? "",
        product_image: i.products?.image_url ?? null,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      // 3) Empty the user's cart
      await supabase.from("cart_items").delete().eq("user_id", user.id);

      toast({ title: "Order placed!", description: "Pay cash on delivery. View it under Orders." });
      navigate("/orders");
    } catch (err: any) {
      toast({ title: "Error placing order", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return <p className="container mx-auto p-8 text-center text-muted-foreground">Your cart is empty.</p>;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm mb-4">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.products?.name} × {i.quantity}</span>
                <span>₹{(Number(i.products?.price ?? 0) * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Shipping Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={placeOrder} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} />
            </div>
            <div className="bg-secondary rounded-md p-3 text-sm">
              💵 Payment Method: <strong>Cash on Delivery</strong>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Placing order..." : `Place Order — ₹${total.toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
