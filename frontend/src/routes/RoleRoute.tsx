import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

type RoleRouteProps = {
  allowedRoles: string[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
