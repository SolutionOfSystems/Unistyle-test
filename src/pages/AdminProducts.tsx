// Admin: add / edit / delete products with multi-image gallery + stock.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";

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

const empty = { name: "", price: "", description: "", category: "men", images: "", stock: "10" };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);

  useEffect(() => { document.title = "Admin — Products"; }, []);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      description: p.description ?? "",
      category: p.category,
      // Combine images[] + legacy image_url into one editable list
      images: (p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : [])).join("\n"),
      stock: String(p.stock ?? 0),
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    // Parse one URL per line, ignore blanks
    const imageList = form.images
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
      category: form.category,
      images: imageList,
      // Keep image_url in sync (first image) so older code still works
      image_url: imageList[0] ?? null,
      stock: parseInt(form.stock, 10) || 0,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Product updated" : "Product added" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    load();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/orders"><Button variant="outline">Orders</Button></Link>
          <Link to="/admin/customers"><Button variant="outline">Customers</Button></Link>
          <Link to="/admin/analytics"><Button variant="outline">Analytics</Button></Link>
          <Button onClick={openCreate}>+ Add Product</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const cover = p.images?.[0] || p.image_url || "/placeholder.svg";
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative">
                      <img src={cover} alt={p.name} className="w-12 h-12 object-cover rounded bg-muted" />
                      {(p.images?.length ?? 0) > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                          {p.images!.length}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="capitalize">{p.category}</TableCell>
                  <TableCell>
                    {p.stock <= 0 ? (
                      <Badge variant="destructive">Out</Badge>
                    ) : p.stock <= 5 ? (
                      <Badge variant="secondary">{p.stock}</Badge>
                    ) : (
                      <span className="text-sm">{p.stock}</span>
                    )}
                  </TableCell>
                  <TableCell>₹{Number(p.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (₹)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image URLs (one per line — first is the cover)</Label>
              <Textarea
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                rows={4}
                placeholder={"https://example.com/front.jpg\nhttps://example.com/back.jpg\nhttps://example.com/detail.jpg"}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">Paste multiple URLs to build a product image gallery.</p>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
