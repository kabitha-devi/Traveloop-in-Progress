import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/shared/Navbar';
import Sidebar from './components/shared/Sidebar';
import ToastContainer from './components/shared/Toast';
import Modal from './components/shared/Modal';
import useAuthStore from './store/authStore';

// Pages
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TripsPage from './pages/TripsPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import CommunityPage from './pages/CommunityPage';
import ChecklistPage from './pages/ChecklistPage';
import NotesPage from './pages/NotesPage';
import InvoicePage from './pages/InvoicePage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><PageWrapper><DashboardPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><PageWrapper><TripsPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/trips/:tripId" element={<ProtectedRoute><PageWrapper><TripDetailPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/create-trip" element={<ProtectedRoute><PageWrapper><CreateTripPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/itinerary-builder/:tripId" element={<ProtectedRoute><PageWrapper><ItineraryBuilderPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/itinerary/:tripId" element={<ProtectedRoute><PageWrapper><ItineraryViewPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><PageWrapper><SearchPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><ProfilePage /></PageWrapper></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><PageWrapper><CommunityPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/checklist" element={<ProtectedRoute><PageWrapper><ChecklistPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><PageWrapper><NotesPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/invoice" element={<ProtectedRoute><PageWrapper><InvoicePage /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><PageWrapper><AdminPage /></PageWrapper></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-background font-body text-text-primary">
      <Navbar />
      <Sidebar />
      <main className={`${!isAuthPage && isAuthenticated ? 'lg:ml-60 print:ml-0 pt-16 print:pt-0' : isAuthPage ? '' : 'pt-16 print:pt-0'}`}>
        <AnimatedRoutes />
      </main>
      <ToastContainer />
      <Modal />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
