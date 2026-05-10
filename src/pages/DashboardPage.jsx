import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MapPin, Globe, Wallet, TrendingUp, ChevronRight, Star } from 'lucide-react';
import useTripStore from '../store/tripStore';
import useAuthStore from '../store/authStore';
import { cities } from '../data/cities';
import { SkeletonCard } from '../components/shared/SkeletonLoader';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { trips } = useTripStore();

  const userTrips = trips.filter(t => t.userId === currentUser?.id || true); // show all for demo
  const completedTrips = userTrips.filter(t => t.status === 'completed');
  const totalBudget = userTrips.reduce((sum, t) => sum + (t.totalBudget || 0), 0);
  const countriesVisited = [...new Set(completedTrips.map(t => t.name))].length;
  const topCities = cities.slice(0, 5);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { icon: MapPin, label: 'Trips Planned', value: userTrips.length, color: 'text-accent' },
    { icon: Globe, label: 'Countries Visited', value: countriesVisited, color: 'text-success' },
    { icon: Wallet, label: 'Total Budget', value: `$${(totalBudget).toLocaleString()}`, color: 'text-warning' },
    { icon: TrendingUp, label: 'Upcoming', value: userTrips.filter(t => t.status === 'upcoming').length, color: 'text-accent' },
  ];

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden mb-8 h-64 md:h-80"
      >
        <img
          src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1600&q=80"
          alt="Travel hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl md:text-5xl font-bold text-white mb-3"
          >
            Where to next,<br />
            <span className="text-gradient">{currentUser?.firstName || 'Explorer'}?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-sm md:text-base max-w-md"
          >
            Discover breathtaking destinations and craft unforgettable journeys.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/create-trip"
              className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Start Planning
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-mono text-xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Top Regional Selections */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Top Regional Selections</h2>
            <p className="section-subtitle mt-1">Trending destinations this season</p>
          </div>
          <Link to="/search" className="btn-ghost flex items-center gap-1 text-sm">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="min-w-[220px]">
                  <SkeletonCard />
                </div>
              ))
            : topCities.map((city, i) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="min-w-[220px] glass-card-hover overflow-hidden cursor-pointer group"
                  onClick={() => navigate('/search')}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="font-display font-bold text-white">{city.name}</h3>
                      <p className="text-white/70 text-xs">{city.country}</p>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star size={12} className="text-warning fill-warning" />
                      <span className="text-white text-xs font-mono">{(city.popularity / 10).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-text-secondary text-xs line-clamp-2">{city.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge-accent text-xs">{'$'.repeat(city.costIndex)}</span>
                      <span className="text-text-secondary text-xs">{city.region}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </section>

      {/* Previous Trips */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Your Trips</h2>
            <p className="section-subtitle mt-1">All your travel plans in one place</p>
          </div>
          <Link to="/trips" className="btn-ghost flex items-center gap-1 text-sm">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : userTrips.slice(0, 6).map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="glass-card-hover overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={trip.coverPhoto}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className={`badge ${
                        trip.status === 'ongoing' ? 'badge-success' :
                        trip.status === 'upcoming' ? 'badge-accent' :
                        'badge-warning'
                      }`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-display font-bold text-white text-lg">{trip.name}</h3>
                      <p className="text-white/60 text-xs font-mono mt-1">
                        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-text-secondary text-sm line-clamp-2">{trip.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-text-secondary">
                        <MapPin size={14} />
                        <span className="text-xs">{trip.stops.length} stops</span>
                      </div>
                      <span className="font-mono text-sm text-accent font-medium">
                        ${trip.totalBudget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </section>

      {/* FAB */}
      <Link to="/create-trip" className="fab" aria-label="Plan a new trip">
        <Plus size={20} />
        <span className="hidden sm:inline">Plan a Trip</span>
      </Link>
    </div>
  );
}
