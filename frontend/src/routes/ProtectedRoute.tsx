import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Login zaroori wale pages ke liye guard.
// Logged-in nahi hai to login page par bhej deta hai.
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged-in hai - andar wale page dikha do
  return <Outlet />
}
