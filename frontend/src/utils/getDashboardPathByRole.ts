export function getDashboardPathByRole(role: string): string {
  if (role === 'Admin') {
    return '/admin'
  }

  if (role === 'Trainer') {
    return '/trainer'
  }

  if (role === 'Student') {
    return '/student'
  }

  return '/'
}
