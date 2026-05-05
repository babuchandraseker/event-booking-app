import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/control-panel-7x92/login" state={{ from: location }} replace />
  }

  return children
}
