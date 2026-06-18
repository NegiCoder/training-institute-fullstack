export type NavItem = {
  to: string
  label: string
  icon: string
  end?: boolean
}

export type NavSection = {
  title?: string
  items: NavItem[]
}

export function getDashboardNav(role: string): NavSection[] {
  if (role === 'Admin') {
    return [
      {
        items: [{ to: '/admin', label: 'Overview', icon: '📊', end: true }],
      },
      {
        title: 'Learning',
        items: [
          { to: '/admin/courses', label: 'Courses', icon: '📚' },
          { to: '/admin/course-categories', label: 'Categories', icon: '🗂️' },
          { to: '/admin/course-pricing', label: 'Pricing', icon: '💰' },
          { to: '/admin/course-trainers', label: 'Trainers', icon: '🧑‍🏫' },
        ],
      },
      {
        title: 'People',
        items: [
          { to: '/admin/students', label: 'Students', icon: '🎓' },
          { to: '/admin/enrollments', label: 'Enrollments', icon: '📋' },
          { to: '/admin/certificates', label: 'Certificates', icon: '🏆' },
        ],
      },
      {
        title: 'Analytics',
        items: [{ to: '/admin/reports', label: 'Reports', icon: '📈' }],
      },
      {
        title: 'More',
        items: [{ to: '/courses', label: 'Catalog', icon: '🔍' }],
      },
    ]
  }

  if (role === 'Trainer') {
    return [
      {
        items: [{ to: '/trainer', label: 'Overview', icon: '📊', end: true }],
      },
      {
        title: 'Teaching',
        items: [
          { to: '/trainer/courses', label: 'My Courses', icon: '📚' },
          { to: '/trainer/modules', label: 'Manage Content', icon: '✏️' },
          { to: '/trainer/students', label: 'My Students', icon: '🎓' },
        ],
      },
      {
        title: 'More',
        items: [{ to: '/courses', label: 'Catalog', icon: '🔍' }],
      },
    ]
  }

  if (role === 'Student') {
    return [
      {
        items: [{ to: '/student', label: 'Continue Learning', icon: '▶️', end: true }],
      },
      {
        title: 'My Learning',
        items: [
          { to: '/student/enrollments', label: 'My Courses', icon: '📚' },
          { to: '/student/certificates', label: 'Certificates', icon: '🏆' },
        ],
      },
      {
        title: 'Account',
        items: [
          { to: '/student/profile', label: 'Profile', icon: '👤' },
          { to: '/courses', label: 'Browse Courses', icon: '🔍' },
        ],
      },
    ]
  }

  if (role === 'BusinessUser') {
    return [
      {
        items: [{ to: '/reports', label: 'Reports', icon: '📈', end: true }],
      },
      {
        title: 'More',
        items: [{ to: '/courses', label: 'Catalog', icon: '🔍' }],
      },
    ]
  }

  return [{ items: [{ to: '/', label: 'Home', icon: '🏠', end: true }] }]
}

export function getRoleLabel(role: string): string {
  if (role === 'BusinessUser') return 'Business User'
  return role
}

export function getDashboardHomePath(role: string): string {
  const sections = getDashboardNav(role)
  return sections[0]?.items[0]?.to ?? '/'
}
