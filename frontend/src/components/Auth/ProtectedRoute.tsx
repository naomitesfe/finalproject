import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../UI/LoadingSpinner";

const ProtectedRoute = ({
  children,
  role,
}: {
  children: JSX.Element;
  role?: string;
}) => {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!profile) return <Navigate to="/login" replace />;

  if (role && profile.role !== role)
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
