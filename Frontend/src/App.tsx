import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import OTPVerification from './components/auth/OTPVerification';
import Dashboard from './components/dashboard/Dashboard';
import JobList from './components/jobs/JobList';
import JobDetail from './components/jobs/JobDetail';
import JobApplicationForm from './components/jobs/JobApplicationForm';
import CreateJobForm from './components/jobs/CreateJobForm';
import MyJobs from './components/jobs/MyJobs';
import ApplicationsList from './components/applications/ApplicationsList';
import ReferralManagement from './components/referrals/ReferralManagement';
import ChatList from './components/chat/ChatList';
import ChatInterface from './components/chat/ChatInterface';
import AdminPanel from './components/admin/AdminPanel';
import PendingApprovals from './components/admin/PendingApprovals';
import Analytics from './components/admin/Analytics';
import Profile from './components/profile/Profile';
import LoadingScreen from './components/animations/LoadingScreen';
import PageTransition from './components/animations/PageTransition';
import AIModelsDashboard from './components/ai/AIModelsDashboard';
import KeywordAnalyzer from './components/ai/KeywordAnalyzer';
import ResumeParser from './components/ai/ResumeParser';
import ResumeAnalyzer from './components/ai/ResumeAnalyzer';
import RoadmapCreator from './components/ai/RoadmapCreator';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <PageTransition>
              <LoginForm />
            </PageTransition>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <PageTransition>
              <RegisterForm />
            </PageTransition>
          </PublicRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicRoute>
            <PageTransition>
              <OTPVerification />
            </PageTransition>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Profile />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <JobList />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <JobDetail />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id/apply"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <JobApplicationForm />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <ApplicationsList />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-job"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <CreateJobForm />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-jobs"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <MyJobs />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/referrals"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <ReferralManagement />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <ChatList />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages/:userId"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <ChatInterface />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <AdminPanel />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <PendingApprovals />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Analytics />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* AI Models Routes */}
      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <AIModelsDashboard />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/keyword-analyzer"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <KeywordAnalyzer />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/resume-parser"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <ResumeParser />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/resume-analyzer"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <ResumeAnalyzer />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/roadmap-creator"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <RoadmapCreator />
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        {isLoading ? (
          <LoadingScreen onComplete={handleLoadingComplete} />
        ) : (
          <Router>
            <AppRoutes />
          </Router>
        )}
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;