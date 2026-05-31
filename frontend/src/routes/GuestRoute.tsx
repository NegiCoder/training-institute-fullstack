import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getDashboardPathByRole } from '@/utils/getDashboardPathByRole'

export function GuestRoute() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />
  }

  return <Outlet />
}
