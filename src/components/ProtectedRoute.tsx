import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {

  const { user, role, loading } = useAuth();

  // Show loading spinner while auth is checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  // If not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin route but not admin → go to home
  if (adminOnly && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}