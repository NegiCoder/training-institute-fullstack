/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

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
