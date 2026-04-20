// Admin: sales analytics — KPIs, revenue over time, top products.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

type OrderRow = { id: string; total: number; created_at: string; status: string };
type ItemRow = { product_name: string; quantity: number; price: number };

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Admin — Analytics"; }, []);

  useEffect(() => {
    const load = async () => {
      const [{ data: o }, { data: i }] = await Promise.all([
        supabase.from("orders").select("id, total, created_at, status"),
        supabase.from("order_items").select("product_name, quantity, price"),
      ]);
      setOrders((o as any) ?? []);
      setItems((i as any) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  // KPIs
  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const orderCount = orders.length;
  const avgOrder = orderCount ? revenue / orderCount : 0;
  const itemsSold = items.reduce((s, i) => s + i.quantity, 0);

  // Revenue over last 14 days
  const revenueByDay = useMemo(() => {
    const days: { date: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key.slice(5), revenue: 0 });
    }
    orders.forEach((o) => {
      const key = new Date(o.created_at).toISOString().slice(5, 10);
      const slot = days.find((d) => d.date === key);
      if (slot) slot.revenue += Number(o.total);
    });
    return days;
  }, [orders]);

  // Top 5 products by units sold
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; units: number; revenue: number }>();
    items.forEach((i) => {
      const cur = map.get(i.product_name) ?? { name: i.product_name, units: 0, revenue: 0 };
      cur.units += i.quantity;
      cur.revenue += i.quantity * Number(i.price);
      map.set(i.product_name, cur);
    });
    return [...map.values()].sort((a, b) => b.units - a.units).slice(0, 5);
  }, [items]);

  if (loading) return <p className="container mx-auto p-8 text-center text-muted-foreground">Loading analytics...</p>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">Sales Analytics</h1>
        <div className="flex gap-2">
          <Link to="/admin/products"><Button variant="outline">Products</Button></Link>
          <Link to="/admin/orders"><Button variant="outline">Orders</Button></Link>
          <Link to="/admin/customers"><Button variant="outline">Customers</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi label="Revenue" value={`₹${revenue.toFixed(2)}`} />
        <Kpi label="Orders" value={String(orderCount)} />
        <Kpi label="Avg. order" value={`₹${avgOrder.toFixed(2)}`} />
        <Kpi label="Items sold" value={String(itemsSold)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Revenue (last 14 days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Top products by units sold</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm py-12 text-center">No sales yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="units" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
