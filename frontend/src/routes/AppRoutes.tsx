import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { GuestRoute } from '@/routes/GuestRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleRoute } from '@/routes/RoleRoute'

/* Public pages — eager load (first paint) */
import { CertificateVerifyPage } from '@/pages/CertificateVerifyPage'
import { CourseCatalogPage } from '@/pages/CourseCatalogPage'
import { CourseDetailPage } from '@/pages/CourseDetailPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

/* Dashboard pages — lazy loaded by role */
const AdminCertificatesPage = lazy(() =>
  import('@/features/admin/pages/AdminCertificatesPage').then((m) => ({
    default: m.AdminCertificatesPage,
  })),
)
const AdminCourseCategoriesPage = lazy(() =>
  import('@/features/admin/pages/AdminCourseCategoriesPage').then((m) => ({
    default: m.AdminCourseCategoriesPage,
  })),
)
const AdminCoursePricingPage = lazy(() =>
  import('@/features/admin/pages/AdminCoursePricingPage').then((m) => ({
    default: m.AdminCoursePricingPage,
  })),
)
const AdminCourseTrainersPage = lazy(() =>
  import('@/features/admin/pages/AdminCourseTrainersPage').then((m) => ({
    default: m.AdminCourseTrainersPage,
  })),
)
const AdminCoursesPage = lazy(() =>
  import('@/features/admin/pages/AdminCoursesPage').then((m) => ({
    default: m.AdminCoursesPage,
  })),
)
const AdminCreateAdminPage = lazy(() =>
  import('@/features/admin/pages/AdminCreateAdminPage').then((m) => ({
    default: m.AdminCreateAdminPage,
  })),
)
const AdminCreateBusinessUserPage = lazy(() =>
  import('@/features/admin/pages/AdminCreateBusinessUserPage').then((m) => ({
    default: m.AdminCreateBusinessUserPage,
  })),
)
const AdminCreateTrainerPage = lazy(() =>
  import('@/features/admin/pages/AdminCreateTrainerPage').then((m) => ({
    default: m.AdminCreateTrainerPage,
  })),
)
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  })),
)
const AdminEnrollmentsPage = lazy(() =>
  import('@/features/admin/pages/AdminEnrollmentsPage').then((m) => ({
    default: m.AdminEnrollmentsPage,
  })),
)
const AdminReportsPage = lazy(() =>
  import('@/features/admin/pages/AdminReportsPage').then((m) => ({
    default: m.AdminReportsPage,
  })),
)
const AdminStudentsPage = lazy(() =>
  import('@/features/admin/pages/AdminStudentsPage').then((m) => ({
    default: m.AdminStudentsPage,
  })),
)
const EnrollmentProgressPage = lazy(() =>
  import('@/features/student/pages/EnrollmentProgressPage').then((m) => ({
    default: m.EnrollmentProgressPage,
  })),
)
const MyCertificatesPage = lazy(() =>
  import('@/features/student/pages/MyCertificatesPage').then((m) => ({
    default: m.MyCertificatesPage,
  })),
)
const MyEnrollmentsPage = lazy(() =>
  import('@/features/student/pages/MyEnrollmentsPage').then((m) => ({
    default: m.MyEnrollmentsPage,
  })),
)
const StudentDashboardPage = lazy(() =>
  import('@/features/student/pages/StudentDashboardPage').then((m) => ({
    default: m.StudentDashboardPage,
  })),
)
const StudentProfilePage = lazy(() =>
  import('@/features/student/pages/StudentProfilePage').then((m) => ({
    default: m.StudentProfilePage,
  })),
)
const TrainerCourseModulesPage = lazy(() =>
  import('@/features/trainer/pages/TrainerCourseModulesPage').then((m) => ({
    default: m.TrainerCourseModulesPage,
  })),
)
const TrainerCoursesPage = lazy(() =>
  import('@/features/trainer/pages/TrainerCoursesPage').then((m) => ({
    default: m.TrainerCoursesPage,
  })),
)
const TrainerDashboardPage = lazy(() =>
  import('@/features/trainer/pages/TrainerDashboardPage').then((m) => ({
    default: m.TrainerDashboardPage,
  })),
)
const TrainerStudentsPage = lazy(() =>
  import('@/features/trainer/pages/TrainerStudentsPage').then((m) => ({
    default: m.TrainerStudentsPage,
  })),
)
const NotificationsPage = lazy(() =>
  import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)

function LazyFallback() {
  return (
    <div className="dashboard-page">
      <DashboardSkeleton statCount={2} cardCount={2} />
    </div>
  )
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LazyFallback />}>{children}</Suspense>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/verify" element={<CertificateVerifyPage />} />
        <Route path="/verify/:certNumber" element={<CertificateVerifyPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/notifications"
            element={
              <LazyPage>
                <NotificationsPage />
              </LazyPage>
            }
          />

          <Route element={<RoleRoute allowedRoles={['Admin', 'BusinessUser']} />}>
            <Route
              path="/reports"
              element={
                <LazyPage>
                  <AdminReportsPage />
                </LazyPage>
              }
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route
              path="/admin"
              element={
                <LazyPage>
                  <AdminDashboardPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/course-categories"
              element={
                <LazyPage>
                  <AdminCourseCategoriesPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <LazyPage>
                  <AdminCoursesPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/course-pricing"
              element={
                <LazyPage>
                  <AdminCoursePricingPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/course-trainers"
              element={
                <LazyPage>
                  <AdminCourseTrainersPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/create-trainer"
              element={
                <LazyPage>
                  <AdminCreateTrainerPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/create-admin"
              element={
                <LazyPage>
                  <AdminCreateAdminPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/create-business-user"
              element={
                <LazyPage>
                  <AdminCreateBusinessUserPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/students"
              element={
                <LazyPage>
                  <AdminStudentsPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/enrollments"
              element={
                <LazyPage>
                  <AdminEnrollmentsPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/certificates"
              element={
                <LazyPage>
                  <AdminCertificatesPage />
                </LazyPage>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <LazyPage>
                  <AdminReportsPage />
                </LazyPage>
              }
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Student']} />}>
            <Route
              path="/student"
              element={
                <LazyPage>
                  <StudentDashboardPage />
                </LazyPage>
              }
            />
            <Route
              path="/student/profile"
              element={
                <LazyPage>
                  <StudentProfilePage />
                </LazyPage>
              }
            />
            <Route
              path="/student/enrollments"
              element={
                <LazyPage>
                  <MyEnrollmentsPage />
                </LazyPage>
              }
            />
            <Route
              path="/student/enrollments/:courseEnrollmentId"
              element={
                <LazyPage>
                  <EnrollmentProgressPage />
                </LazyPage>
              }
            />
            <Route
              path="/student/certificates"
              element={
                <LazyPage>
                  <MyCertificatesPage />
                </LazyPage>
              }
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Trainer']} />}>
            <Route
              path="/trainer"
              element={
                <LazyPage>
                  <TrainerDashboardPage />
                </LazyPage>
              }
            />
            <Route
              path="/trainer/courses"
              element={
                <LazyPage>
                  <TrainerCoursesPage />
                </LazyPage>
              }
            />
            <Route
              path="/trainer/modules"
              element={
                <LazyPage>
                  <TrainerCourseModulesPage />
                </LazyPage>
              }
            />
            <Route
              path="/trainer/students"
              element={
                <LazyPage>
                  <TrainerStudentsPage />
                </LazyPage>
              }
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
