import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-500" data-testid="auth-loading">Loading...</div>
      </div>
    );
  }
  if (user === false || !user) return <Navigate to="/login" replace />;
  return children;
}
