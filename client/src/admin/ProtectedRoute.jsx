import { Navigate } from "react-router-dom";
import "../admin.css";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/control-panel-7x92/login" replace />;
  }

  return children;
}