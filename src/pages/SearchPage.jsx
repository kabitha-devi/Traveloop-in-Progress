import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon, Plus, Clock, DollarSign, X, Check,
  MapPin, Sparkles, ChevronRight, Star, Users, AlertCircle, Loader2,
  Compass, ArrowRight, Navigation, ExternalLink
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTripStore from '../store/tripStore';
import useToast from '../hooks/useToast';
import { aiApi } from '../utils/api';

const API_URL = 'http://localhost:5000/api';

// Category-specific fallback images (relevant, not generic lake photos)
const CATEGORY_IMAGES = {
  Adventure:      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  Culture:        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
  'Food & Drink': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'Food & Culture':'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  Nature:         'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  Wellness:       'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  Shopping:       'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
  Nightlife:      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  Spiritual:      'https://images.unsplash.com/photo-1561361058-c24e01238a46?w=800&q=80',
  Luxury:         'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
};
const GENERIC_FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80';

const CATEGORY_ICONS = {
  Adventure: '🧗',
  Culture: '🏛️',
  'Food & Drink': '🍜',
  'Food & Culture': '🍜',
  Nature: '🌿',
  Wellness: '🧘',
  Shopping: '🛍️',
  Nightlife: '🌃',
  Spiritual: '🕌',
  Luxury: '💎',
};

const POPULAR_CITIES = [
  { name: 'Paris', emoji: '🗼' },
  { name: 'Tokyo', emoji: '⛩️' },
  { name: 'Goa', emoji: '🏖️' },
  { name: 'Kerala', emoji: '🌴' },
  { name: 'Dubai', emoji: '🏙️' },
  { name: 'Tirupati', emoji: '🙏' },
  { name: 'Bali', emoji: '🌺' },
  { name: 'New York', emoji: '🗽' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const { trips, addTrip } = useTripStore();
  const toast = useToast();

  const [inputCity, setInputCity] = useState('');
  const [searchedCity, setSearchedCity] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Detail modal
  const [detailItem, setDetailItem] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailCoords, setDetailCoords] = useState(null);
  const [coordsLoading, setCoordsLoading] = useState(false);

  async function handleOpenDetails(item) {
    setDetailItem(item);
    setLoadingDetails(true);
    try {
      const deepData = await aiApi.getActivityDetails(searchedCity, item.name);
      setDetailItem(prev => (prev && prev.name === item.name) ? { ...prev, ...deepData } : prev);
    } catch (err) {
      console.error('Failed to fetch deep details:', err);
    } finally {
      setLoadingDetails(false);
    }
  }

  // Geocode when detail modal opens (OpenStreetMap Nominatim — free, no key)
  useEffect(() => {
    if (!detailItem) { setDetailCoords(null); return; }
    setCoordsLoading(true);
    const query = `${detailItem.location || detailItem.name}, ${searchedCity}`;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } })
      .then(r => r.json())
      .then(data => {
        if (data && data[0]) setDetailCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name });
        else setDetailCoords(null);
      })
      .catch(() => setDetailCoords(null))
      .finally(() => setCoordsLoading(false));
  }, [detailItem]);

  function handleGetDirections() {
    const dest = encodeURIComponent(`${detailItem.name}, ${searchedCity}`);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${dest}`, '_blank'),
        ()    => window.open(`https://www.google.com/maps/search/${dest}`, '_blank')
      );
    } else {
      window.open(`https://www.google.com/maps/search/${dest}`, '_blank');
    }
  }

  // Add-to-trip modal
  const [addTarget, setAddTarget] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || '');
  const [addMode, setAddMode] = useState('select'); // 'select' | 'create'
  const [newTripName, setNewTripName] = useState('');

  const inputRef = useRef(null);

  // ── Fetch from backend AI ──
  async function fetchActivities(city) {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setActiveCategory('All');
    setResults([]);
    setSearchedCity(city.trim());

    try {
      const res = await fetch(
        `${API_URL}/ai/suggest-activities?city=${encodeURIComponent(city.trim())}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Failed to fetch activities');

      // Normalize type → category; fix generic/wrong fallback images
      const normalized = (data.data || []).map((act, i) => {
        const cat = act.type || act.category || 'Culture';
        const img = act.image;
        // Replace the generic lake/mountain fallback with category-specific ones
        const isGenericFallback = !img || img.includes('1476514525535') || img.includes('photo-1507003211169');
        return {
          ...act,
          id: act.id || `ai-${i}-${Date.now()}`,
          category: cat,
          image: isGenericFallback ? (CATEGORY_IMAGES[cat] || GENERIC_FALLBACK) : img,
        };
      });
      setResults(normalized);
    } catch (err) {
      setError(err.message);
      toast.error('Could not load activities. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchActivities(inputCity);
  }

  function handleCityChip(city) {
    setInputCity(city);
    fetchActivities(city);
  }

  // ── Category filtering ──
  const visibleResults = activeCategory === 'All'
    ? results
    : results.filter(a => {
        const cat = (a.category || '').toLowerCase();
        const filter = activeCategory.toLowerCase();
        return cat.includes(filter) || filter.includes(cat);
      });

  // Unique categories from results
  const resultCategories = ['All', ...Array.from(new Set(results.map(a => a.category).filter(Boolean)))];

  // ── Add to trip handler ──
  function handleAdd() {
    if (addMode === 'create') {
      const name = newTripName.trim();
      if (!name) { toast.warning('Please enter a trip name'); return; }
      const newTrip = addTrip({
        name,
        description: `Trip planned from Explore — ${searchedCity}`,
        destination: searchedCity,
        status: 'upcoming',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalBudget: 0,
        stops: [],
      });
      toast.success(`🎉 Trip "${name}" created! "${addTarget.name}" added.`);
      setNewTripName('');
      setAddMode('select');
      setAddTarget(null);
    } else {
      if (!selectedTripId) { toast.warning('Select a trip first'); return; }
      const trip = trips.find(t => t.id === selectedTripId);
      toast.success(`✅ "${addTarget.name}" added to "${trip?.name || 'your trip'}"!`);
      setAddTarget(null);
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Compass size={20} className="text-white" />
          </div>
          <div>
            <h1 className="section-title text-3xl mb-0">Explore</h1>
            <p className="section-subtitle text-sm">Search any city — get real, AI-powered activity recommendations</p>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative mb-4 mt-6 flex gap-3"
      >
        <div className="relative flex-1">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
          <input
            ref={inputRef}
            type="text"
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            placeholder="Type a city name (e.g. Tokyo, Goa, Paris)..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-base"
          />
        </div>
        <button
          type="submit"
          disabled={!inputCity.trim() || loading}
          className="btn-primary px-6 py-4 rounded-2xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <SearchIcon size={18} />}
          {loading ? 'Searching...' : 'Search'}
        </button>
      </motion.form>

      {/* Popular city chips */}
      {!hasSearched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
          <p className="text-xs text-text-secondary mb-2 font-medium uppercase tracking-wider">Popular Destinations</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map(({ name, emoji }) => (
              <button
                key={name}
                onClick={() => handleCityChip(name)}
                className="px-3 py-1.5 bg-white/5 hover:bg-accent/20 border border-white/10 hover:border-accent/40 rounded-full text-sm text-text-secondary hover:text-accent transition-all flex items-center gap-1.5"
              >
                <span>{emoji}</span> {name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Filters — only after search */}
      {hasSearched && !loading && results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 pb-1">
          {resultCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'bg-accent text-white shadow-lg shadow-accent/30'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              {cat !== 'All' && <span>{CATEGORY_ICONS[cat] || '📍'}</span>}
              {cat}
              {cat !== 'All' && (
                <span className={`text-[10px] px-1 rounded-full ${activeCategory === cat ? 'bg-white/20' : 'bg-white/10'}`}>
                  {results.filter(a => (a.category || '').toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes((a.category || '').toLowerCase())).length}
                </span>
              )}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── State: initial / empty ── */}
      {!hasSearched && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="glass-card p-12 flex flex-col items-center justify-center text-center mt-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-5">
            <Sparkles size={36} className="text-accent" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Discover Any City</h2>
          <p className="text-text-secondary max-w-sm text-sm leading-relaxed">
            Type any city name and get real AI-powered recommendations for adventure, food, culture, wellness, and more — specific to that city.
          </p>
          <div className="flex items-center gap-2 mt-5 text-xs text-text-secondary/70">
            <Sparkles size={12} className="text-accent" />
            Powered by Gemini AI
          </div>
        </motion.div>
      )}

      {/* ── State: loading ── */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4 animate-pulse">
              <div className="w-20 h-20 rounded-xl bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded-lg w-2/3" />
                <div className="h-3 bg-white/5 rounded-lg w-full" />
                <div className="h-3 bg-white/5 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
          <p className="text-center text-text-secondary text-sm pt-2 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-accent animate-pulse" />
            AI is fetching real activities in <span className="text-accent font-semibold">{searchedCity}</span>...
          </p>
        </motion.div>
      )}

      {/* ── State: error ── */}
      {hasSearched && !loading && error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 flex flex-col items-center text-center">
          <AlertCircle size={40} className="text-red-400 mb-3" />
          <h3 className="font-semibold text-text-primary mb-1">Could not load activities</h3>
          <p className="text-text-secondary text-sm mb-4">{error}</p>
          <button onClick={() => fetchActivities(searchedCity)} className="btn-primary text-sm">Try Again</button>
        </motion.div>
      )}

      {/* ── State: results ── */}
      {hasSearched && !loading && !error && results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-text-secondary">
              Showing <span className="text-text-primary font-semibold">{visibleResults.length}</span> activities in{' '}
              <span className="text-accent font-semibold">{searchedCity}</span>
            </p>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary/60 bg-white/5 px-2.5 py-1 rounded-full">
              <Sparkles size={10} className="text-accent" /> AI-generated
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visibleResults.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer group"
                  onClick={() => handleOpenDetails(item)}
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'; }}
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ChevronRight size={20} className="text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">{item.name}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {item.category && (
                        <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          <span>{CATEGORY_ICONS[item.category] || '📍'}</span>{item.category}
                        </span>
                      )}
                      {item.duration && (
                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                          <Clock size={10} />{item.duration}
                        </span>
                      )}
                      {(item.priceStr || item.cost !== undefined) && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <DollarSign size={10} />
                          {item.priceStr ? item.priceStr : (item.cost === 0 ? 'Free' : `$${item.cost}`)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenDetails(item)}
                      className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      Details <ChevronRight size={12} />
                    </button>
                    <button
                      onClick={() => { setAddTarget(item); setSelectedTripId(trips[0]?.id || ''); }}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      <Plus size={12} />Add
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ── State: no results after search ── */}
      {hasSearched && !loading && !error && results.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 flex flex-col items-center text-center">
          <SearchIcon size={36} className="text-text-secondary/40 mb-3" />
          <h3 className="font-semibold text-text-primary mb-1">No results for "{searchedCity}"</h3>
          <p className="text-text-secondary text-sm">Try a different city name or check spelling.</p>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {detailItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setDetailItem(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card max-w-lg w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Hero image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={detailItem.image}
                  alt={detailItem.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <button
                  onClick={() => setDetailItem(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-4 left-4 right-14">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-accent/80 text-white px-2.5 py-1 rounded-full mb-2">
                    {CATEGORY_ICONS[detailItem.category] || '📍'} {detailItem.category}
                  </span>
                  <h2 className="text-white font-bold text-xl leading-tight">{detailItem.name}</h2>
                  <p className="text-white/70 text-sm">{searchedCity}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto relative">
                {loadingDetails && (
                  <div className="sticky top-0 left-0 right-0 bg-black/60 text-accent px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-2 backdrop-blur-md z-10 mb-4 border border-accent/20">
                    <Loader2 size={12} className="animate-spin" /> AI is fetching real-time deep details from the web...
                  </div>
                )}
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  {(detailItem.priceStr || detailItem.cost !== undefined) && (
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <DollarSign size={16} className="text-emerald-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-text-primary">
                        {detailItem.priceStr ? detailItem.priceStr : (detailItem.cost === 0 ? 'Free' : `$${detailItem.cost}`)}
                      </div>
                      <div className="text-[10px] text-text-secondary">Cost</div>
                    </div>
                  )}
                  {detailItem.duration && (
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Clock size={16} className="text-accent mx-auto mb-1" />
                      <div className="text-sm font-bold text-text-primary">{detailItem.duration}</div>
                      <div className="text-[10px] text-text-secondary">Duration</div>
                    </div>
                  )}
                  {detailItem.minAge !== undefined && (
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Users size={16} className="text-blue-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-text-primary">{detailItem.minAge === 0 ? 'All ages' : `${detailItem.minAge}+`}</div>
                      <div className="text-[10px] text-text-secondary">Min Age</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">About</h4>
                  <p className="text-sm text-text-primary leading-relaxed">{detailItem.description}</p>
                </div>

                {/* Highlights */}
                {detailItem.highlights && detailItem.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Highlights</h4>
                    <ul className="space-y-1.5">
                      {detailItem.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                          <Star size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Best for / includes */}
                <div className="grid grid-cols-2 gap-3">
                  {detailItem.bestFor && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Best For</p>
                      <p className="text-xs text-text-primary">{detailItem.bestFor}</p>
                    </div>
                  )}
                  {detailItem.includes && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Includes</p>
                      <p className="text-xs text-text-primary">{detailItem.includes}</p>
                    </div>
                  )}
                </div>

                {/* ── Deep Details ── */}
                {detailItem.facilities && detailItem.facilities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {detailItem.facilities.map((fac, i) => (
                        <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-text-primary">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(detailItem.accommodation?.available || detailItem.food?.available) && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {detailItem.accommodation?.available && (
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-text-primary mb-1 flex items-center gap-1.5">🏨 Accommodation</h4>
                        <p className="text-[10px] text-text-secondary mb-1.5">{detailItem.accommodation.price_range || 'Contact for pricing'}</p>
                        <ul className="text-[10px] text-text-primary space-y-0.5 mb-2">
                          {detailItem.accommodation.options?.map((opt, i) => <li key={i}>• {opt}</li>)}
                        </ul>
                        {detailItem.accommodation.booking_link && (
                          <a href={detailItem.accommodation.booking_link} target="_blank" rel="noreferrer" className="text-[10px] text-accent hover:underline flex items-center gap-1">
                            Book / Info <ExternalLink size={8} />
                          </a>
                        )}
                      </div>
                    )}
                    {detailItem.food?.available && (
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-text-primary mb-1 flex items-center gap-1.5">🍽️ Food Options</h4>
                        <p className="text-[10px] text-text-secondary mb-1.5 line-clamp-2">{detailItem.food.details}</p>
                        <ul className="text-[10px] text-text-primary space-y-0.5">
                          {detailItem.food.options?.map((opt, i) => <li key={i}>• {opt}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {detailItem.contact && (
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Contact Info</h4>
                    <div className="space-y-1.5 text-xs text-text-primary">
                      {detailItem.contact.phone && <p className="flex items-start gap-1.5"><strong className="text-text-secondary w-14 shrink-0">Phone:</strong> <span className="break-all">{detailItem.contact.phone}</span></p>}
                      {detailItem.contact.email && <p className="flex items-start gap-1.5"><strong className="text-text-secondary w-14 shrink-0">Email:</strong> <span className="break-all">{detailItem.contact.email}</span></p>}
                      {detailItem.contact.website && (
                        <p className="flex items-center gap-1.5">
                          <strong className="text-text-secondary w-14 shrink-0">Website:</strong> 
                          <a href={detailItem.contact.website} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1">Visit Site <ExternalLink size={10} /></a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Location + Map ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={11} /> Location
                    </h4>
                    <button
                      onClick={handleGetDirections}
                      className="flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      <Navigation size={11} /> Get Directions
                      <ExternalLink size={10} />
                    </button>
                  </div>

                  {/* Address line */}
                  {detailItem.location && (
                    <p className="text-xs text-text-secondary mb-2 flex items-start gap-1.5">
                      <MapPin size={11} className="text-accent flex-shrink-0 mt-0.5" />
                      {detailItem.location}, {searchedCity}
                    </p>
                  )}
                  {!detailItem.location && (
                    <p className="text-xs text-text-secondary mb-2 flex items-center gap-1.5">
                      <MapPin size={11} className="text-accent" /> {searchedCity}
                    </p>
                  )}

                  {/* Map embed — OpenStreetMap (free, no API key) */}
                  <div className="rounded-xl overflow-hidden border border-white/10 relative">
                    {coordsLoading && (
                      <div className="absolute inset-0 bg-white/5 flex items-center justify-center z-10">
                        <Loader2 size={20} className="animate-spin text-accent" />
                      </div>
                    )}
                    {detailCoords ? (
                      <iframe
                        title={`Map – ${detailItem.name}`}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${detailCoords.lng-0.015},${detailCoords.lat-0.015},${detailCoords.lng+0.015},${detailCoords.lat+0.015}&layer=mapnik&marker=${detailCoords.lat},${detailCoords.lng}`}
                        width="100%"
                        height="190"
                        style={{ border: 0, display: 'block' }}
                        loading="lazy"
                        allowFullScreen
                      />
                    ) : !coordsLoading ? (
                      /* Fallback: Google Maps embed search */
                      <iframe
                        title={`Map – ${detailItem.name}`}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent((detailItem.location || detailItem.name) + ', ' + searchedCity)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="190"
                        style={{ border: 0, display: 'block' }}
                        loading="lazy"
                        allowFullScreen
                      />
                    ) : null}
                    {detailCoords && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${detailCoords.lat}&mlon=${detailCoords.lng}#map=15/${detailCoords.lat}/${detailCoords.lng}`}
                        target="_blank" rel="noreferrer"
                        className="block text-[10px] text-center text-text-secondary/50 py-1 bg-black/30 hover:text-accent transition-colors"
                      >
                        View larger map on OpenStreetMap ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* ── Verified Source ── */}
                {detailItem.source && (
                  <div className="pt-2 mt-2 border-t border-white/5 text-center">
                    <a href={detailItem.source} target="_blank" rel="noreferrer" className="text-[10px] text-text-secondary hover:text-accent flex items-center justify-center gap-1">
                      <Sparkles size={10} className="text-accent" /> Source: {new URL(detailItem.source).hostname}
                    </a>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="px-5 pb-5 flex gap-3">
                <button
                  onClick={() => setDetailItem(null)}
                  className="btn-ghost flex-1 py-3"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setAddTarget(detailItem);
                    setSelectedTripId(trips[0]?.id || '');
                    setDetailItem(null);
                  }}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add to Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          ADD-TO-TRIP MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {addTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setAddTarget(null); setAddMode('select'); setNewTripName(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="glass-card max-w-sm w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-text-primary">Add to Trip</h2>
                <button
                  onClick={() => { setAddTarget(null); setAddMode('select'); setNewTripName(''); }}
                  className="btn-ghost p-1"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Activity preview */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4">
                <img
                  src={addTarget.image}
                  alt={addTarget.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80'; }}
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">{addTarget.name}</p>
                  <p className="text-xs text-accent">{addTarget.category} · {searchedCity}</p>
                </div>
              </div>

              {/* Mode toggle tabs */}
              <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-4">
                <button
                  onClick={() => setAddMode('select')}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
                    addMode === 'select'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Select Existing
                </button>
                <button
                  onClick={() => setAddMode('create')}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
                    addMode === 'create'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  + Create New Trip
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* ── Select existing trip ── */}
                {addMode === 'select' && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {trips.length === 0 ? (
                      <div className="text-center py-3">
                        <p className="text-text-secondary text-sm mb-3">No trips yet — create one below!</p>
                        <button
                          onClick={() => setAddMode('create')}
                          className="btn-primary text-sm flex items-center gap-2 mx-auto"
                        >
                          <Plus size={14} /> Create a Trip
                        </button>
                      </div>
                    ) : (
                      <>
                        <label className="text-xs text-text-secondary uppercase tracking-wider font-medium block mb-1.5">Select Trip</label>
                        <select
                          value={selectedTripId}
                          onChange={e => setSelectedTripId(e.target.value)}
                          className="input-field mb-4"
                        >
                          {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button onClick={handleAdd} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                          <Check size={16} /> Confirm Add
                        </button>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── Create new trip ── */}
                {addMode === 'create' && (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <label className="text-xs text-text-secondary uppercase tracking-wider font-medium block mb-1.5">Trip Name</label>
                    <input
                      type="text"
                      value={newTripName}
                      onChange={e => setNewTripName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdd()}
                      placeholder={`e.g. My ${searchedCity} Adventure`}
                      autoFocus
                      className="input-field mb-1"
                    />
                    <p className="text-[11px] text-text-secondary/60 mb-4">This will appear in My Trips immediately.</p>
                    <button
                      onClick={handleAdd}
                      disabled={!newTripName.trim()}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} /> Create Trip &amp; Add Activity
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
