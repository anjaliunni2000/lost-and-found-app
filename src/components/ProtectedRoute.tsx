import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  adminOnly = false
}: any) {

  const { user, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}
