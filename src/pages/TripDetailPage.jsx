import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Wallet, Edit3, ArrowLeft, Share2, FileText, CheckSquare,
  CloudRain, Sun, Cloud, Sparkles, TrendingDown, AlertTriangle, Loader2, BookOpen
} from 'lucide-react';
import useTripStore from '../store/tripStore';
import { activities as allActivities } from '../data/activities';
import { weatherApi, aiApi } from '../utils/api';
import useToast from '../hooks/useToast';

const weatherIcons = {
  clear: Sun, clouds: Cloud, rain: CloudRain, snow: Cloud,
  thunderstorm: CloudRain, drizzle: CloudRain, mist: Cloud,
};

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { trips, stops } = useTripStore();
  const trip = trips.find(t => t.id === tripId);
  const tripStops = stops.filter(s => s.tripId === tripId);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [budgetResult, setBudgetResult] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [conflictLoading, setConflictLoading] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  if (!trip) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-text-secondary">Trip not found</p>
        <Link to="/trips" className="btn-primary mt-4 inline-block">Back to Trips</Link>
      </div>
    );
  }

  const dayCount = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000*60*60*24)) + 1;
  const destination = tripStops[0]?.cityName || trip.name.split(' ')[0];

  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const data = await weatherApi.getForecast(destination);
      setWeather(data);
      setActivePanel('weather');
      toast.success('Weather forecast loaded! 🌤️');
    } catch (error) {
      toast.error('Failed to fetch weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const optimizeBudget = async () => {
    setBudgetLoading(true);
    try {
      const data = await aiApi.optimizeBudget(tripId);
      setBudgetResult(data);
      setActivePanel('budget');
      toast.success('Budget optimized! 💰');
    } catch (error) {
      toast.error('Failed to optimize budget');
    } finally {
      setBudgetLoading(false);
    }
  };

  const detectConflicts = async () => {
    setConflictLoading(true);
    try {
      const data = await aiApi.detectConflicts(tripId);
      setConflicts(data);
      setActivePanel('conflicts');
      toast.success('Conflicts analyzed! 🔍');
    } catch (error) {
      toast.error('Failed to detect conflicts');
    } finally {
      setConflictLoading(false);
    }
  };

  return (
    <div className="page-container">
      <button onClick={() => navigate('/trips')} className="btn-ghost flex items-center gap-2 mb-4 text-sm">
        <ArrowLeft size={16} /> Back to Trips
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden mb-8 h-64 md:h-80">
        <img src={trip.coverPhoto} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <span className={`badge mb-3 ${trip.status === 'ongoing' ? 'badge-success' : trip.status === 'upcoming' ? 'badge-accent' : 'badge-warning'}`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">{trip.name}</h1>
          <p className="text-white/60 text-sm font-mono">
            {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Edit3, label: 'Edit Itinerary', to: `/itinerary-builder/${tripId}` },
          { icon: FileText, label: 'View Invoice', to: '/invoice' },
          { icon: CheckSquare, label: 'Packing List', to: '/checklist' },
          { icon: BookOpen, label: 'Trip Journal', to: '/notes' },
        ].map(({ icon: Icon, label, to }) => (
          <Link key={label} to={to}
            className="glass-card p-3 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all">
            <Icon size={16} className="text-accent" /> {label}
          </Link>
        ))}
      </div>

      {/* AI Feature Buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-6 border border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-accent" />
          <h3 className="font-display font-semibold text-sm text-text-primary">AI-Powered Insights</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchWeather} disabled={weatherLoading}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-2">
            {weatherLoading ? <Loader2 size={12} className="animate-spin" /> : <CloudRain size={12} />}
            Weather Forecast
          </button>
          <button onClick={optimizeBudget} disabled={budgetLoading}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-2">
            {budgetLoading ? <Loader2 size={12} className="animate-spin" /> : <TrendingDown size={12} />}
            Optimize Budget
          </button>
          <button onClick={detectConflicts} disabled={conflictLoading}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-2">
            {conflictLoading ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
            Detect Conflicts
          </button>
        </div>
      </motion.div>

      {/* AI Result Panels */}
      <AnimatePresence>
        {/* Weather Panel */}
        {activePanel === 'weather' && weather && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-5 mb-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <Sun size={16} className="text-warning" /> 5-Day Forecast for {destination}
              </h3>
              <button onClick={() => setActivePanel(null)} className="text-text-secondary text-xs hover:text-text-primary">✕</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {weather.map((day, i) => {
                const WeatherIcon = weatherIcons[day.condition] || Cloud;
                return (
                  <div key={i} className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-text-secondary font-mono mb-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <WeatherIcon size={24} className={`mx-auto mb-1 ${day.condition === 'rain' ? 'text-blue-400' : day.condition === 'clear' ? 'text-warning' : 'text-text-secondary'}`} />
                    <p className="font-mono text-sm font-bold text-text-primary">{Math.round(day.temp)}°C</p>
                    <p className="text-xs text-text-secondary capitalize">{day.condition}</p>
                    {day.rainChance > 0 && (
                      <p className="text-xs text-blue-400 font-mono">💧 {day.rainChance}%</p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Budget Optimizer Panel */}
        {activePanel === 'budget' && budgetResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-5 mb-6 border border-success/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <TrendingDown size={16} className="text-success" /> Budget Optimization
              </h3>
              <button onClick={() => setActivePanel(null)} className="text-text-secondary text-xs hover:text-text-primary">✕</button>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-success/10 text-center">
              <p className="font-mono text-2xl font-bold text-success">${budgetResult.totalPotentialSaving}</p>
              <p className="text-xs text-text-secondary">Potential Savings</p>
            </div>
            <div className="space-y-3">
              {budgetResult.savings?.map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{s.category}</span>
                    <span className="font-mono text-xs text-success">Save ${s.saving}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{s.suggestion}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="font-mono text-xs text-text-secondary/60 line-through">${s.currentCost}</span>
                    <span className="font-mono text-xs text-accent">${s.suggestedCost}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Conflict Detection Panel */}
        {activePanel === 'conflicts' && conflicts && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-5 mb-6 border border-warning/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning" /> Conflict Detection
              </h3>
              <button onClick={() => setActivePanel(null)} className="text-text-secondary text-xs hover:text-text-primary">✕</button>
            </div>
            {conflicts.conflicts?.length === 0 ? (
              <p className="text-sm text-success text-center py-4">✅ No conflicts detected!</p>
            ) : (
              <div className="space-y-3">
                {conflicts.conflicts?.map((c, i) => (
                  <div key={i} className={`p-3 rounded-xl ${c.severity === 'high' ? 'bg-red-500/10' : c.severity === 'medium' ? 'bg-warning/10' : 'bg-white/5'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${c.severity === 'high' ? 'bg-red-400' : c.severity === 'medium' ? 'bg-warning' : 'bg-blue-400'}`}></span>
                      <span className="text-sm font-medium text-text-primary capitalize">{c.type.replace(/_/g, ' ')}</span>
                      <span className={`text-xs ml-auto px-2 py-0.5 rounded-full ${c.severity === 'high' ? 'bg-red-500/20 text-red-400' : c.severity === 'medium' ? 'bg-warning/20 text-warning' : 'bg-blue-500/20 text-blue-400'}`}>
                        {c.severity}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{c.description}</p>
                    {c.suggestion && <p className="text-xs text-accent mt-1">💡 {c.suggestion}</p>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8">
        <h2 className="font-display font-semibold text-lg mb-3">Trip Overview</h2>
        <p className="text-text-secondary text-sm mb-4">{trip.description}</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center"><p className="font-mono text-xl font-bold text-accent">{tripStops.length}</p><p className="text-xs text-text-secondary">Stops</p></div>
          <div className="text-center"><p className="font-mono text-xl font-bold text-success">{dayCount}</p><p className="text-xs text-text-secondary">Days</p></div>
          <div className="text-center"><p className="font-mono text-xl font-bold text-warning">${trip.totalBudget.toLocaleString()}</p><p className="text-xs text-text-secondary">Budget</p></div>
        </div>
      </motion.div>

      {/* Itinerary Stops */}
      <h2 className="section-title mb-4">Itinerary Stops</h2>
      <div className="space-y-4">
        {tripStops.map((stop, i) => {
          const acts = stop.activities.map(aId => allActivities.find(a => a.id === aId)).filter(Boolean);
          return (
            <motion.div key={stop.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }} className="glass-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center">
                    <span className="text-accent font-mono font-bold">{i + 1}</span>
                  </div>
                  {i < tripStops.length - 1 && <div className="w-0.5 h-8 bg-accent/20 mt-2"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg"><MapPin size={16} className="inline mr-1 text-accent" />{stop.cityName}</h3>
                    <span className="font-mono text-sm text-accent">${stop.budget.toLocaleString()}</span>
                  </div>
                  <p className="text-text-secondary text-xs font-mono mt-1">
                    {new Date(stop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(stop.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  {acts.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {acts.map(a => <span key={a.id} className="badge bg-white/5 text-text-secondary text-xs">{a.name}</span>)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
