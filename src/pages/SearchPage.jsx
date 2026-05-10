import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, Plus, Clock, DollarSign, Tag } from 'lucide-react';
import { cities } from '../data/cities';
import { activities } from '../data/activities';
import useToast from '../hooks/useToast';
import { SkeletonList } from '../components/shared/SkeletonLoader';
import EmptyState from '../components/shared/EmptyState';

const categories = ['All', 'Adventure', 'Food & Drink', 'Culture', 'Wellness', 'Shopping', 'Luxury', 'Nightlife'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchType, setSearchType] = useState('activities');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  const filteredActivities = activities.filter(a => {
    const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.country.toLowerCase().includes(query.toLowerCase()) || c.region.toLowerCase().includes(query.toLowerCase())
  );

  const results = searchType === 'activities' ? filteredActivities : filteredCities;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl mb-2">Explore</h1>
        <p className="section-subtitle mb-6">Discover activities and destinations</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-6">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activities, cities, experiences..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-base" />
      </motion.div>

      {/* Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setSearchType('activities')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchType === 'activities' ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
          Activities ({filteredActivities.length})
        </button>
        <button onClick={() => setSearchType('cities')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchType === 'cities' ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
          Cities ({filteredCities.length})
        </button>
      </div>

      {/* Category Filters */}
      {searchType === 'activities' && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? <SkeletonList count={5} /> : results.length === 0 ? (
        <EmptyState title="No results found" description="Try a different search term or filter" icon={SearchIcon} />
      ) : (
        <div className="space-y-3">
          {results.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-card-hover p-4 flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-primary truncate">{item.name}</h3>
                <p className="text-xs text-text-secondary line-clamp-1">{item.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  {item.category && <span className="flex items-center gap-1 text-xs text-accent"><Tag size={10} />{item.category}</span>}
                  {item.duration && <span className="flex items-center gap-1 text-xs text-text-secondary"><Clock size={10} />{item.duration}</span>}
                  {item.cost !== undefined && <span className="flex items-center gap-1 text-xs text-warning"><DollarSign size={10} />${item.cost}</span>}
                  {item.region && <span className="text-xs text-text-secondary">{item.country} · {item.region}</span>}
                </div>
              </div>
              <button onClick={() => toast.success(`${item.name} added to trip!`)}
                className="btn-primary text-xs px-3 py-2 flex-shrink-0">
                <Plus size={14} className="inline mr-1" />Add
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
