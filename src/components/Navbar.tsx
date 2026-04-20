// Top navigation bar — visible on every page.
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, LogOut, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/unistyle-mark.png";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // Load number of items currently in the user's cart (for badge)
  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id);
      setCartCount(data?.reduce((sum, r) => sum + r.quantity, 0) ?? 0);
    };
    load();

    // Refresh count on cart changes
    const channel = supabase
      .channel("cart-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <nav className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="UniStyle home">
          <img src={logo} alt="UniStyle logo" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold tracking-tight text-primary hidden sm:inline">UniStyle</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="text-sm hover:text-muted-foreground hidden sm:inline">Home</Link>

          {user && (
            <Link to="/orders" className="text-sm hover:text-muted-foreground hidden sm:flex items-center gap-1">
              <Package className="h-4 w-4" /> Orders
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin/products" className="text-sm hover:text-muted-foreground flex items-center gap-1">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-1" /> Login
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
