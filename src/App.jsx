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

function AnimatedRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={isAuthenticated ? <PageWrapper><DashboardPage /></PageWrapper> : <Navigate to="/auth" />} />
        <Route path="/trips" element={<PageWrapper><TripsPage /></PageWrapper>} />
        <Route path="/trips/:tripId" element={<PageWrapper><TripDetailPage /></PageWrapper>} />
        <Route path="/create-trip" element={<PageWrapper><CreateTripPage /></PageWrapper>} />
        <Route path="/itinerary-builder/:tripId" element={<PageWrapper><ItineraryBuilderPage /></PageWrapper>} />
        <Route path="/itinerary/:tripId" element={<PageWrapper><ItineraryViewPage /></PageWrapper>} />
        <Route path="/search" element={<PageWrapper><SearchPage /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/community" element={<PageWrapper><CommunityPage /></PageWrapper>} />
        <Route path="/checklist" element={<PageWrapper><ChecklistPage /></PageWrapper>} />
        <Route path="/notes" element={<PageWrapper><NotesPage /></PageWrapper>} />
        <Route path="/invoice" element={<PageWrapper><InvoicePage /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminPage /></PageWrapper>} />
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
      <main className={`${!isAuthPage && isAuthenticated ? 'lg:ml-60 pt-16' : isAuthPage ? '' : 'pt-16'}`}>
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
