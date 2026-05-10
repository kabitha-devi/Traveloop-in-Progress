import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { toggleMobileSidebar } = useUiStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const initials = currentUser
    ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  if (location.pathname === '/auth') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden btn-ghost p-2"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">T</span>
            </div>
            <h1 className="font-display font-bold text-xl text-text-primary hidden sm:block group-hover:text-accent transition-colors">
              Traveloop
            </h1>
          </Link>
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className={`relative w-full transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search destinations, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm 
                         text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 
                         focus:ring-2 focus:ring-accent/20 transition-all duration-300"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="btn-ghost p-2 relative" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          <Link
            to="/profile"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center 
                       text-white text-sm font-bold hover:shadow-glow transition-all duration-300 hover:scale-110"
            aria-label="Profile"
          >
            {initials}
          </Link>
        </div>
      </div>
    </nav>
  );
}
