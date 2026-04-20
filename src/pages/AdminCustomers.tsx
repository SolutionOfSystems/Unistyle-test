// Admin: read-only customer list with order count and total spent.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

type Customer = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { document.title = "Admin — Customers"; }, []);

  useEffect(() => {
    const load = async () => {
      // Pull all profiles + all orders, then aggregate client-side.
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("id, name, email, created_at").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total"),
      ]);
      const byUser = new Map<string, { count: number; spent: number }>();
      (orders ?? []).forEach((o) => {
        const cur = byUser.get(o.user_id) ?? { count: 0, spent: 0 };
        cur.count += 1;
        cur.spent += Number(o.total);
        byUser.set(o.user_id, cur);
      });
      const merged: Customer[] = (profiles ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        created_at: p.created_at,
        order_count: byUser.get(p.id)?.count ?? 0,
        total_spent: byUser.get(p.id)?.spent ?? 0,
      }));
      setCustomers(merged);
      setLoading(false);
    };
    load();
  }, []);

  const visible = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Link to="/admin/products"><Button variant="outline">Products</Button></Link>
          <Link to="/admin/orders"><Button variant="outline">Orders</Button></Link>
          <Link to="/admin/analytics"><Button variant="outline">Analytics</Button></Link>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading customers...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{c.order_count}</TableCell>
                  <TableCell className="text-right font-semibold">₹{c.total_spent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
