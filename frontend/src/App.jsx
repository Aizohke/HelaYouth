import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { UserProvider, useAppUser } from './context/UserContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import { SignInPage, SignUpPage, PendingApproval, NotFound } from './pages/index.jsx';
import MemberPortfolio from './pages/MemberPortfolio';
import AdminDashboard from './pages/AdminDashboard';
import MindsetHub from './pages/MindsetHub';
import ArticleDetail from './pages/ArticleDetail';
import RecruitmentPage from './pages/RecruitmentPage';

// Route guards
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { isApproved, isPending, loading } = useAppUser();

  if (!isLoaded || loading) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  if (isPending) return <Navigate to="/pending" replace />;
  if (!isApproved) return <Navigate to="/sign-in" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { isAdmin, isApproved, loading } = useAppUser();

  if (!isLoaded || loading) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  if (!isApproved) return <Navigate to="/pending" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        <p className="text-stone-500 font-body text-sm">Loading Hela Youth…</p>
      </div>
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/mindset" element={<MindsetHub />} />
        <Route path="/mindset/:slug" element={<ArticleDetail />} />
        <Route path="/pending" element={<PendingApproval />} />

        {/* Protected - Members */}
        <Route path="/portfolio" element={<ProtectedRoute><MemberPortfolio /></ProtectedRoute>} />

        {/* Protected - Admin */}
        <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}
