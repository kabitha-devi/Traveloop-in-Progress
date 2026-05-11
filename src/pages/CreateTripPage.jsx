import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Sparkles, ArrowRight, Loader2, Brain, Zap, X, Info } from 'lucide-react';
import useTripStore from '../store/tripStore';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';
import { cities } from '../data/cities';
import { activities } from '../data/activities';
import { aiApi } from '../utils/api';

export default function CreateTripPage() {
  const [form, setForm] = useState({ name: '', destination: '', startDate: '', endDate: '', budget: '' });
  const [selectedCity, setSelectedCity] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showMoodPlanner, setShowMoodPlanner] = useState(false);
  const [mood, setMood] = useState('');
  const [preferences, setPreferences] = useState('');
  const [isBleisure, setIsBleisure] = useState(false);
  const [businessCommitments, setBusinessCommitments] = useState('');
  const [suggestedActivities, setSuggestedActivities] = useState(activities.slice(0, 6));
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { addTrip } = useTripStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.country.toLowerCase().includes(query.toLowerCase())
  );

  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    setQuery(city.name);
    setForm(prev => ({ ...prev, destination: city.name }));
    setShowSuggestions(false);

    setLoadingActivities(true);
    try {
      const dynamicActs = await aiApi.suggestActivities(city.name);
      if (dynamicActs && dynamicActs.length > 0) {
        // ensure each object has an id for keys
        const mapped = dynamicActs.map((act, i) => ({ ...act, id: `ai-${i}` }));
        setSuggestedActivities(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch dynamic activities:', e);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!form.destination) {
      toast.warning('Please select a destination first');
      return;
    }
    const days = form.startDate && form.endDate
      ? Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1
      : 5;

    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await aiApi.generateTrip({
        query: `${days}-day trip to ${form.destination}`,
        budget: parseInt(form.budget) || 5000,
        days,
        travelers: 1,
        preferences: preferences || 'culture and adventure',
        isBleisure,
        businessCommitments,
      });
      setAiResult(result);
      toast.success('AI itinerary generated! 🤖');
    } catch (error) {
      toast.error(error.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleMoodPlan = async () => {
    if (!mood) { toast.warning('Select a mood first'); return; }
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await aiApi.moodPlanner({
        mood,
        destination: form.destination || 'anywhere',
        budget: parseInt(form.budget) || 5000,
        days: form.startDate && form.endDate
          ? Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1
          : 7,
      });
      setAiResult(result);
      toast.success('Mood-based trip planned! ✨');
    } catch (error) {
      toast.error(error.message || 'Mood planner failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddToTrip = (activity) => {
    if (!aiResult) {
      const days = form.startDate && form.endDate
        ? Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1
        : 5;

      setAiResult({
        tripName: `Trip to ${form.destination || 'New Place'}`,
        stops: [{
          city: form.destination || 'Destination',
          days: days,
          activities: [{
            name: activity.name,
            cost: activity.cost || 0,
            time: '10:00',
            type: activity.category || activity.type,
            description: activity.description
          }]
        }],
        budgetBreakdown: {
          activities: activity.cost || 0,
          food: 100,
          transport: 100,
          accommodation: 200,
          misc: 50
        }
      });
    } else {
      setAiResult(prev => {
        const newResult = JSON.parse(JSON.stringify(prev)); // Deep clone
        if (!newResult.stops || newResult.stops.length === 0) {
          newResult.stops = [{ city: form.destination || 'Destination', days: 1, activities: [] }];
        }
        
        const stop = newResult.stops[0];
        if (!stop.activities) stop.activities = [];
        
        stop.activities.push({
          name: activity.name,
          cost: activity.cost || 0,
          time: stop.activities.length === 0 ? '10:00' : '14:00',
          type: activity.category || activity.type,
          description: activity.description
        });

        if (newResult.budgetBreakdown) {
          newResult.budgetBreakdown.activities = (newResult.budgetBreakdown.activities || 0) + (activity.cost || 0);
        }
        
        return newResult;
      });
    }
    toast.success(`✅ "${activity.name}" added to your itinerary!`);
    setSelectedActivity(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.destination || !form.startDate || !form.endDate) {
      toast.warning('Please fill in all required fields');
      return;
    }
    const trip = addTrip({
      userId: currentUser?.id || 'u1',
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      coverPhoto: selectedCity?.image || '/images/hero.png',
      totalBudget: parseInt(form.budget) || 0,
      description: `Trip to ${form.destination}`,
    });
    toast.success('Trip created! Now build your itinerary 🗺️');
    navigate(`/itinerary-builder/${trip.id}`);
  };

  const moods = [
    { value: 'adventure', label: '🏔️ Adventure', color: 'from-orange-500/20 to-red-500/20' },
    { value: 'relax', label: '🏖️ Relaxation', color: 'from-blue-500/20 to-cyan-500/20' },
    { value: 'culture', label: '🏛️ Cultural', color: 'from-purple-500/20 to-pink-500/20' },
    { value: 'party', label: '🎉 Nightlife', color: 'from-yellow-500/20 to-orange-500/20' },
    { value: 'nature', label: '🌿 Nature', color: 'from-green-500/20 to-emerald-500/20' },
    { value: 'romantic', label: '💕 Romantic', color: 'from-pink-500/20 to-rose-500/20' },
  ];

  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl mb-2">Plan a New Trip</h1>
        <p className="section-subtitle mb-8">Let's create something unforgettable</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-text-primary mb-4">Trip Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Trip Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Paris & Rome Adventure" className="input-field" />
            </div>

            {/* City Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                <MapPin size={14} className="inline mr-1" /> Select a Place
              </label>
              <input type="text" value={query}
                onChange={(e) => { 
                  setQuery(e.target.value); 
                  setForm(prev => ({ ...prev, destination: e.target.value }));
                  setShowSuggestions(true); 
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search cities..."
                className="input-field" />
              {showSuggestions && query && (
                <div className="absolute z-20 top-full mt-1 w-full glass-card max-h-60 overflow-y-auto">
                  {filteredCities.map(city => (
                    <button key={city.id} type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <img src={city.image} alt={city.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{city.name}</p>
                        <p className="text-xs text-text-secondary">{city.country} · {city.region}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  <Calendar size={14} className="inline mr-1" /> Start Date
                </label>
                <input type="date" value={form.startDate}
                  onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="input-field font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  <Calendar size={14} className="inline mr-1" /> End Date
                </label>
                <input type="date" value={form.endDate}
                  onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="input-field font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Budget (USD)</label>
              <input type="number" value={form.budget}
                onChange={(e) => setForm(p => ({ ...p, budget: e.target.value }))}
                placeholder="5000" className="input-field font-mono" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Preferences (optional)</label>
              <input type="text" value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g., beaches, food tours, hiking..." className="input-field" />
            </div>
          </div>
        </motion.div>

        {/* ✨ AI Trip Generator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-6 border border-accent/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Brain size={18} className="text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-text-primary">AI Trip Planner</h3>
              <p className="text-xs text-text-secondary">Let AI create your perfect itinerary</p>
            </div>
          </div>

          {/* Bleisure Toggle */}
          <div className="mb-4 p-4 rounded-xl border border-accent/20 bg-accent/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">👔🌴</span>
                <span className="font-semibold text-sm text-text-primary">Bleisure Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isBleisure} onChange={() => setIsBleisure(!isBleisure)} />
                <div className="w-11 h-6 bg-surface border border-border/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary peer-checked:after:bg-accent after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <AnimatePresence>
              {isBleisure && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="text-xs text-text-secondary mb-2 mt-1">Combine your business trip with leisure.</p>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Business Commitments</label>
                  <input type="text" value={businessCommitments} onChange={(e) => setBusinessCommitments(e.target.value)}
                    placeholder="e.g. Conference on Thursday 9am-5pm" className="input-field" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button type="button" onClick={handleAIGenerate} disabled={aiLoading}
              className="btn-primary flex items-center gap-2 text-sm">
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Generate AI Itinerary
            </button>
            <button type="button" onClick={() => setShowMoodPlanner(!showMoodPlanner)}
              className="btn-secondary flex items-center gap-2 text-sm">
              <Zap size={14} /> Mood-Based Plan
            </button>
          </div>

          {/* Mood Planner */}
          <AnimatePresence>
            {showMoodPlanner && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {moods.map(m => (
                    <button key={m.value} type="button"
                      onClick={() => setMood(m.value)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all bg-gradient-to-br ${m.color}
                        ${mood === m.value ? 'ring-2 ring-accent scale-105' : 'hover:scale-102 opacity-70 hover:opacity-100'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={handleMoodPlan} disabled={aiLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Plan by Mood
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* AI Result */}
        <AnimatePresence>
          {aiResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-card p-6 border border-success/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-success" />
                <h3 className="font-display font-semibold text-lg text-text-primary">
                  {aiResult.tripName || 'AI Generated Itinerary'}
                </h3>
              </div>

              {aiResult.stops?.map((stop, i) => (
                <div key={i} className="mb-4 p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-accent" />
                    <span className="font-display font-semibold text-text-primary">{stop.city}</span>
                    <span className="text-xs text-text-secondary font-mono ml-auto">{stop.days} days</span>
                  </div>
                  {stop.activities?.map((act, j) => (
                    <div key={j} className="flex items-center gap-2 pl-5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/60"></div>
                      <span className="text-sm text-text-secondary">{act.name}</span>
                      <span className="text-xs font-mono text-accent ml-auto">{act.time} · ${act.cost}</span>
                    </div>
                  ))}
                  {stop.hotel && (
                    <p className="text-xs text-text-secondary/60 pl-5 mt-1 font-mono">
                      🏨 {stop.hotel.name} — ${stop.hotel.pricePerNight}/night
                    </p>
                  )}
                </div>
              ))}

              {aiResult.budgetBreakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                  {Object.entries(aiResult.budgetBreakdown).map(([key, val]) => (
                    <div key={key} className="text-center p-2 rounded-lg bg-white/5">
                      <p className="font-mono text-sm text-accent font-bold">${val}</p>
                      <p className="text-xs text-text-secondary capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              )}

              {aiResult.tips && (
                <div className="space-y-1">
                  {aiResult.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-success mt-0.5">💡</span> {tip}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-accent" />
            <h3 className="font-display font-semibold text-lg text-text-primary">
              {loadingActivities ? 'Finding top activities...' : 'Suggested Activities'}
            </h3>
            {loadingActivities && <Loader2 size={16} className="text-accent animate-spin" />}
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${loadingActivities ? 'opacity-50' : ''}`}>
            {suggestedActivities.map((activity) => (
              <div key={activity.id} onClick={() => setSelectedActivity(activity)} className="glass-card-hover overflow-hidden cursor-pointer group">
                <div className="relative h-28 overflow-hidden">
                  <img src={activity.image} alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-2">
                    <p className="text-white text-xs font-medium truncate w-full pr-2">{activity.name}</p>
                    <p className="text-white/60 text-xs font-mono">${activity.cost || activity.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Details Modal */}
        <AnimatePresence>
          {selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
              onClick={() => setSelectedActivity(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="glass-card max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Hero Image */}
                <div className="relative h-56 flex-shrink-0">
                  <img
                    src={selectedActivity.image}
                    alt={selectedActivity.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                  {/* Category badge on image */}
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-accent/80 text-white border-0 backdrop-blur-sm">
                      {selectedActivity.category || selectedActivity.type}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Title + Price */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="text-2xl font-display font-bold text-text-primary leading-tight">
                      {selectedActivity.name}
                    </h2>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-2xl font-mono font-bold text-accent">
                        ${selectedActivity.cost ?? selectedActivity.price ?? 0}
                      </p>
                      <p className="text-xs text-text-secondary">per person</p>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-text-secondary">
                    {selectedActivity.duration && (
                      <span className="flex items-center gap-1">
                        <span className="text-accent">⏱</span> {selectedActivity.duration}
                      </span>
                    )}
                    {selectedActivity.minAge !== undefined && (
                      <span className="flex items-center gap-1">
                        <span className="text-accent">👶</span> Min age: {selectedActivity.minAge === 0 ? 'All ages' : `${selectedActivity.minAge}+`}
                      </span>
                    )}
                    {selectedActivity.bestFor && (
                      <span className="flex items-center gap-1">
                        <span className="text-accent">❤️</span> {selectedActivity.bestFor}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {selectedActivity.description ||
                        'A top-rated activity perfect for your trip. Book in advance to secure your spot!'}
                    </p>
                  </div>

                  {/* Highlights */}
                  {selectedActivity.highlights && selectedActivity.highlights.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-display font-semibold text-text-primary mb-2 flex items-center gap-1">
                        <span className="text-accent">✨</span> Highlights
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedActivity.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What's Included */}
                  {selectedActivity.includes && (
                    <div className="mb-5">
                      <h3 className="text-sm font-display font-semibold text-text-primary mb-2 flex items-center gap-1">
                        <span className="text-accent">🎫</span> What's Included
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedActivity.includes.split(', ').map((item, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToTrip(selectedActivity)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Info size={15} /> Add to Trip
                    </button>
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="btn-secondary px-4"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
            Continue to Itinerary <ArrowRight size={18} />
          </button>
        </motion.div>
      </form>
    </div>
  );
}
