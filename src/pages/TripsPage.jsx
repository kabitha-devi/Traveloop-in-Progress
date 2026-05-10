import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Calendar, MapPin, Trash2, Eye, Edit3 } from 'lucide-react';
import useTripStore from '../store/tripStore';
import useToast from '../hooks/useToast';
import EmptyState from '../components/shared/EmptyState';
import { SkeletonCard } from '../components/shared/SkeletonLoader';

const statusTabs = ['all', 'ongoing', 'upcoming', 'completed'];

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { trips, deleteTrip } = useTripStore();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = trips.filter(t => {
    const matchesTab = activeTab === 'all' || t.status === activeTab;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleDelete = (e, tripId) => {
    e.stopPropagation();
    deleteTrip(tripId);
    toast.success('Trip deleted successfully');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="section-title text-3xl mb-2">My Trips</h1>
        <p className="section-subtitle">Manage all your travel plans</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => navigate('/create-trip')}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus size={16} />
          New Trip
        </button>
      </motion.div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
              ${activeTab === tab
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-2 text-xs opacity-60">
              ({tab === 'all' ? trips.length : trips.filter(t => t.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Trip Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No trips found"
          description={searchQuery ? 'Try a different search term' : 'Start planning your first adventure!'}
          action={() => navigate('/create-trip')}
          actionLabel="Plan a Trip"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={trip.coverPhoto}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3">
                  <span className={`badge ${
                    trip.status === 'ongoing' ? 'badge-success' :
                    trip.status === 'upcoming' ? 'badge-accent' :
                    'badge-warning'
                  }`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <h3 className="font-display font-bold text-white text-lg">{trip.name}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-text-secondary text-xs mb-2">
                  <Calendar size={12} />
                  <span className="font-mono">
                    {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-text-secondary text-sm line-clamp-2 mb-3">{trip.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-text-secondary">
                    <MapPin size={14} />
                    <span className="text-xs">{trip.stops.length} stops</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}
                      className="btn-ghost p-1.5"
                      aria-label="View trip"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/itinerary-builder/${trip.id}`); }}
                      className="btn-ghost p-1.5"
                      aria-label="Edit trip"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, trip.id)}
                      className="btn-ghost p-1.5 text-danger hover:text-danger"
                      aria-label="Delete trip"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
