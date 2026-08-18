import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store'

export default function ProtectedRoute() {
  const admin = useAuthStore((s) => s.admin)
  if (!admin) return <Navigate to="/login" replace />
  return <Outlet />
}
