import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

type RoleRouteProps = {
  allowedRoles: string[]
}

// Role-based guard. allowedRoles me jo role hai sirf wahi andar aa sakta hai.
// Example: Admin pages ke liye allowedRoles = ['Admin'].
export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user)

  // Galat role wala user home par bhej do
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
