import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import CourseExplore from './pages/CourseExplore';
import VerifyCertificate from './pages/VerifyCertificate';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import OAuthCallback from './pages/OAuthCallback';

// Protected pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CourseDetail from './pages/CourseDetail';
import CourseLearn from './pages/CourseLearn';
import CourseCreate from './pages/CourseCreate';
import ExamTake from './pages/ExamTake';
import ExamCreate from './pages/ExamCreate';
import AssignmentView from './pages/AssignmentView';
import CertificateView from './pages/CertificateView';
import AdminPanel from './pages/AdminPanel';
import AssignmentCreate from './pages/AssignmentCreate';
import GradingDashboard from './pages/GradingDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        
        {/* Standalone Auth Routes */}
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Public pages under MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseExplore />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
        </Route>

        {/* Protected Dashboard pages */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
          
          {/* Instructor routes */}
          <Route path="/course/create" element={<ProtectedRoute roles={['instructor', 'admin']}><CourseCreate /></ProtectedRoute>} />
          <Route path="/course/:id/edit" element={<ProtectedRoute roles={['instructor', 'admin']}><CourseCreate /></ProtectedRoute>} />
          <Route path="/exams/:id/create" element={<ProtectedRoute roles={['instructor', 'admin']}><ExamCreate /></ProtectedRoute>} />
          <Route path="/course/:courseId/assignments/create" element={<ProtectedRoute roles={['instructor', 'admin']}><AssignmentCreate /></ProtectedRoute>} />
          <Route path="/assignments/:id/edit" element={<ProtectedRoute roles={['instructor', 'admin']}><AssignmentCreate /></ProtectedRoute>} />
          <Route path="/assignments/:id/grade" element={<ProtectedRoute roles={['instructor', 'admin']}><GradingDashboard /></ProtectedRoute>} />
        </Route>

        {/* Dynamic Learning Space & Assessments (Standalone Layouts / Custom Views) */}
        <Route path="/courses/:id" element={<ProtectedRoute><MainLayout><CourseDetail /></MainLayout></ProtectedRoute>} />
        <Route path="/courses/:id/learn" element={<ProtectedRoute><CourseLearn /></ProtectedRoute>} />
        <Route path="/exams/:id/take" element={<ProtectedRoute><ExamTake /></ProtectedRoute>} />
        <Route path="/assignments/:id/view" element={<ProtectedRoute><MainLayout><AssignmentView /></MainLayout></ProtectedRoute>} />
        <Route path="/certificates/:id" element={<ProtectedRoute><MainLayout><CertificateView /></MainLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="/404" element={<MainLayout><NotFound /></MainLayout>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
