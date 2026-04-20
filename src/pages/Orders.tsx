// Order history page — shows the logged-in user's past orders with their items.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type OrderItem = { id: string; quantity: number; price: number; product_name: string; product_image: string | null };
type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_name: string;
  order_items: OrderItem[];
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "My Orders — UniStyle"; }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("id, status, total, created_at, shipping_name, order_items(id, quantity, price, product_name, product_image)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as any) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <p className="container mx-auto p-8 text-center text-muted-foreground">Loading orders...</p>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link to="/"><Button>Start Shopping</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={o.status === "Delivered" ? "default" : "secondary"}>{o.status}</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {o.order_items.map((it) => (
                    <li key={it.id} className="flex gap-3 items-center text-sm">
                      <img src={it.product_image || "/placeholder.svg"} alt={it.product_name} className="w-12 h-12 object-cover rounded bg-muted" />
                      <span className="flex-1">{it.product_name} × {it.quantity}</span>
                      <span>₹{(Number(it.price) * it.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span><span>₹{Number(o.total).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
