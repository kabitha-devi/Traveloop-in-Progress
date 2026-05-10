import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, PlusCircle, Search, Users, CheckSquare,
  BookOpen, FileText, ShieldCheck, User, X, Compass, LogOut
} from 'lucide-react';
import useUiStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/trips', label: 'My Trips', icon: Map },
  { path: '/create-trip', label: 'Plan a Trip', icon: PlusCircle },
  { path: '/search', label: 'Explore', icon: Search },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/checklist', label: 'Packing', icon: CheckSquare },
  { path: '/notes', label: 'Journal', icon: BookOpen },
  { path: '/invoice', label: 'Invoices', icon: FileText },
  { path: '/admin', label: 'Admin', icon: ShieldCheck },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  if (location.pathname === '/auth') return null;

  const sidebarContent = (
    <div className="flex flex-col h-full pt-20 pb-6 px-3">
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary/30 text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto px-3 py-4 space-y-3">
        <div className="glass-card p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center">
              <Compass size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-primary">Pro Tip</p>
              <p className="text-xs text-text-secondary">Drag sections to reorder your itinerary</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-60 bg-surface/50 backdrop-blur-xl border-r border-white/5 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-surface border-r border-white/10 z-50 lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="btn-ghost p-2"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
