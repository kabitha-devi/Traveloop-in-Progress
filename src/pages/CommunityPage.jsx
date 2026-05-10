import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Copy, MapPin, TrendingUp, Flame } from 'lucide-react';
import useTripStore from '../store/tripStore';
import { cities } from '../data/cities';
import { activities } from '../data/activities';
import useToast from '../hooks/useToast';

export default function CommunityPage() {
  const { trips, addTrip } = useTripStore();
  const [query, setQuery] = useState('');
  const toast = useToast();
  const [likedIds, setLikedIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});

  const publicTrips = trips.map((t, i) => ({
    ...t,
    likes: likeCounts[t.id] ?? Math.floor(Math.random() * 200) + 20,
    saves: Math.floor(Math.random() * 50) + 5,
    author: ['Alex R.', 'Priya S.', 'Marco R.', 'Yuki T.', 'Fatima A.'][i % 5],
  }));

  const filtered = publicTrips.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  const trendingCities = [...cities].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const popularActivities = [...activities].sort((a, b) => b.cost - a.cost).slice(0, 5);

  const handleLike = (trip) => {
    const isLiked = likedIds.has(trip.id);
    setLikedIds(prev => {
      const next = new Set(prev);
      isLiked ? next.delete(trip.id) : next.add(trip.id);
      return next;
    });
    setLikeCounts(prev => ({
      ...prev,
      [trip.id]: (prev[trip.id] ?? trip.likes) + (isLiked ? -1 : 1),
    }));
    toast.info(isLiked ? 'Unliked' : '❤️ Liked!');
  };

  const handleCopyTrip = (trip) => {
    const copied = {
      ...trip,
      id: `copy_${trip.id}_${Date.now()}`,
      name: `${trip.name} (Copy)`,
      status: 'upcoming',
      userId: 'current',
    };
    addTrip(copied);
    toast.success(`✅ "${trip.name}" copied to your trips!`);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl mb-2">Community</h1>
        <p className="section-subtitle mb-6">Get inspired by fellow travelers</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Feed */}
        <div className="flex-1">
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search shared trips..." className="input-field pl-10" />
          </div>

          <div className="space-y-4">
            {filtered.map((trip, i) => (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card-hover overflow-hidden">
                <div className="relative h-52">
                  <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display font-bold text-xl text-white mb-1">{trip.name}</h3>
                    <p className="text-white/60 text-sm">{trip.description}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs text-white font-bold">
                        {trip.author[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{trip.author}</p>
                        <p className="text-xs text-text-secondary">{trip.stops.length} stops · {Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000*60*60*24))} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className={`flex items-center gap-1 transition-colors ${likedIds.has(trip.id) ? 'text-danger' : 'text-text-secondary hover:text-danger'}`}
                        onClick={() => handleLike(trip)}
                      >
                        <Heart size={16} className={likedIds.has(trip.id) ? 'fill-danger' : ''} />
                        <span className="text-xs">{likeCounts[trip.id] ?? trip.likes}</span>
                      </button>
                      <button onClick={() => handleCopyTrip(trip)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                        <Copy size={12} /> Copy Trip
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Flame size={16} className="text-warning" /> Trending Destinations</h3>
            <div className="space-y-3">
              {trendingCities.map((city, i) => (
                <div key={city.id} className="flex items-center gap-3">
                  <span className="font-mono text-sm text-text-secondary w-5">{i + 1}</span>
                  <img src={city.image} alt={city.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{city.name}</p>
                    <p className="text-xs text-text-secondary">{city.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-accent" /> Popular Activities</h3>
            <div className="space-y-3">
              {popularActivities.map(a => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <p className="text-sm flex-1">{a.name}</p>
                  <span className="text-xs font-mono text-text-secondary">${a.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
