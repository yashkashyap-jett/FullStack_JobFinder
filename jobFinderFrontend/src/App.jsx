import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public pages
import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import NotFound        from './pages/NotFound';

// Candidate pages
import CandidateDashboard    from './pages/candidate/CandidateDashboard';
import CandidateProfile      from './pages/candidate/CandidateProfile';
import CandidateJobs         from './pages/candidate/CandidateJobs';
import CandidateApplications from './pages/candidate/CandidateApplications';
import CandidateBookmarks    from './pages/candidate/CandidateBookmarks';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile   from './pages/recruiter/RecruiterProfile';
import RecruiterJobs      from './pages/recruiter/RecruiterJobs';

// Page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ── Toast notifications ──────────────────────────────────── */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#1e293b' },
              duration: 3000,
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1e293b' },
              duration: 4000,
            },
          }}
        />

        {/* ── Layout ───────────────────────────────────────────────── */}
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* ── Public Routes ──────────────────────────────────── */}
              <Route
                path="/"
                element={
                  <PageWrapper>
                    <LandingPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/login"
                element={
                  <PageWrapper>
                    <LoginPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/register"
                element={
                  <PageWrapper>
                    <RegisterPage />
                  </PageWrapper>
                }
              />

              {/* ── Candidate Routes ───────────────────────────────── */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute role="candidate">
                    <PageWrapper><CandidateDashboard /></PageWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute role="candidate">
                    <PageWrapper><CandidateProfile /></PageWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs"
                element={
                  <ProtectedRoute role="candidate">
                    <PageWrapper><CandidateJobs /></PageWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute role="candidate">
                    <PageWrapper><CandidateApplications /></PageWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/bookmarks"
                element={
                  <ProtectedRoute role="candidate">
                    <PageWrapper><CandidateBookmarks /></PageWrapper>
                  </ProtectedRoute>
                }
              />

              {/* ── Recruiter Routes ───────────────────────────────── */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute role="recruiter">
                    <PageWrapper><RecruiterDashboard /></PageWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/profile"
                element={
                  <ProtectedRoute role="recruiter">
                    <PageWrapper><RecruiterProfile /></PageWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute role="recruiter">
                    <PageWrapper><RecruiterJobs /></PageWrapper>
                  </ProtectedRoute>
                }
              />

              {/* ── Fallback redirects ─────────────────────────────── */}
              <Route path="/candidate" element={<Navigate to="/candidate/dashboard" replace />} />
              <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />

              {/* ── 404 ───────────────────────────────────────────── */}
              <Route
                path="*"
                element={
                  <PageWrapper>
                    <NotFound />
                  </PageWrapper>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
