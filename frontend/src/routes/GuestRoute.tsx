import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getDashboardPathByRole } from '@/utils/getDashboardPathByRole'

// Sirf guest (logged-out) ke liye - jaise login/register pages.
// Already logged-in user ko uske dashboard par redirect kar deta hai.
export function GuestRoute() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />
  }

  return <Outlet />
}
