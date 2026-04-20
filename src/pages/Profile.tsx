// Profile page — view + update display name, see account stats.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Profile — UniStyle"; }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Profile row
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email, created_at")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setName(profile.name ?? "");
        setEmail(profile.email ?? user.email ?? "");
        setCreatedAt(profile.created_at);
      } else {
        setEmail(user.email ?? "");
      }

      // Order stats
      const { data: orders } = await supabase
        .from("orders")
        .select("total")
        .eq("user_id", user.id);
      setOrderCount(orders?.length ?? 0);
      setTotalSpent((orders ?? []).reduce((s, o) => s + Number(o.total), 0));
      setLoading(false);
    };
    load();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profile updated" });
  };

  if (loading) return <p className="container mx-auto p-8 text-center text-muted-foreground">Loading...</p>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-2xl font-bold">{orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total spent</p>
            <p className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Member since</p>
            <p className="text-sm font-medium mt-1">
              {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Account details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
