// Wrap any route that should only be visible to logged-in users.
// If user is not logged in -> redirect to /auth.
// If `adminOnly` is true and user isn't an admin -> redirect home.
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="container mx-auto p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
