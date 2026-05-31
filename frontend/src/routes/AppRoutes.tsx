import { Route, Routes } from 'react-router-dom'
import { AdminCertificatesPage } from '@/features/admin/pages/AdminCertificatesPage'
import { AdminCourseCategoriesPage } from '@/features/admin/pages/AdminCourseCategoriesPage'
import { AdminCoursePricingPage } from '@/features/admin/pages/AdminCoursePricingPage'
import { AdminCourseTrainersPage } from '@/features/admin/pages/AdminCourseTrainersPage'
import { AdminCoursesPage } from '@/features/admin/pages/AdminCoursesPage'
import { AdminCreateAdminPage } from '@/features/admin/pages/AdminCreateAdminPage'
import { AdminCreateTrainerPage } from '@/features/admin/pages/AdminCreateTrainerPage'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminEnrollmentsPage } from '@/features/admin/pages/AdminEnrollmentsPage'
import { AdminStudentsPage } from '@/features/admin/pages/AdminStudentsPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { EnrollmentProgressPage } from '@/features/student/pages/EnrollmentProgressPage'
import { MyCertificatesPage } from '@/features/student/pages/MyCertificatesPage'
import { MyEnrollmentsPage } from '@/features/student/pages/MyEnrollmentsPage'
import { StudentDashboardPage } from '@/features/student/pages/StudentDashboardPage'
import { StudentProfilePage } from '@/features/student/pages/StudentProfilePage'
import { TrainerCourseModulesPage } from '@/features/trainer/pages/TrainerCourseModulesPage'
import { TrainerCoursesPage } from '@/features/trainer/pages/TrainerCoursesPage'
import { TrainerDashboardPage } from '@/features/trainer/pages/TrainerDashboardPage'
import { TrainerStudentsPage } from '@/features/trainer/pages/TrainerStudentsPage'
import { PublicLayout } from '@/layouts/PublicLayout'
import { CourseCatalogPage } from '@/pages/CourseCatalogPage'
import { CourseDetailPage } from '@/pages/CourseDetailPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { GuestRoute } from '@/routes/GuestRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleRoute } from '@/routes/RoleRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route
              path="/admin/course-categories"
              element={<AdminCourseCategoriesPage />}
            />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/course-pricing" element={<AdminCoursePricingPage />} />
            <Route
              path="/admin/course-trainers"
              element={<AdminCourseTrainersPage />}
            />
            <Route path="/admin/create-trainer" element={<AdminCreateTrainerPage />} />
            <Route path="/admin/create-admin" element={<AdminCreateAdminPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/enrollments" element={<AdminEnrollmentsPage />} />
            <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Student']} />}>
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/enrollments" element={<MyEnrollmentsPage />} />
            <Route
              path="/student/enrollments/:courseEnrollmentId"
              element={<EnrollmentProgressPage />}
            />
            <Route path="/student/certificates" element={<MyCertificatesPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Trainer']} />}>
            <Route path="/trainer" element={<TrainerDashboardPage />} />
            <Route path="/trainer/courses" element={<TrainerCoursesPage />} />
            <Route path="/trainer/modules" element={<TrainerCourseModulesPage />} />
            <Route path="/trainer/students" element={<TrainerStudentsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
