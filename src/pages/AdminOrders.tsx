// Admin: view all orders and update their status.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

type OrderItem = { id: string; quantity: number; price: number; product_name: string };
type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_name: string;
  shipping_address: string;
  order_items: OrderItem[];
};

const STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { document.title = "Admin — Orders"; }, []);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, status, total, created_at, shipping_name, shipping_address, order_items(id, quantity, price, product_name)")
      .order("created_at", { ascending: false });
    setOrders((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status updated" });
    load();
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Orders</h1>
        <Link to="/admin/products"><Button variant="outline">Manage Products</Button></Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-mono text-muted-foreground">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <Badge>{o.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p><strong>Ship to:</strong> {o.shipping_name}</p>
                  <p className="text-muted-foreground">{o.shipping_address}</p>
                </div>
                <ul className="text-sm space-y-1">
                  {o.order_items.map((it) => (
                    <li key={it.id} className="flex justify-between">
                      <span>{it.product_name} × {it.quantity}</span>
                      <span>${(Number(it.price) * it.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold">Total: ${Number(o.total).toFixed(2)}</span>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
