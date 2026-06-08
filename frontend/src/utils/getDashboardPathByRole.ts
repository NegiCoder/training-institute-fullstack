// Role ke hisab se login ke baad konsa dashboard kholna hai
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

  // BusinessUser sidha reports dashboard par jaata hai
  if (role === 'BusinessUser') {
    return '/reports'
  }

  return '/'
}
