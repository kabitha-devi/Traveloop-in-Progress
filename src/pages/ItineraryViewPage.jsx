import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { List, CalendarDays, ArrowDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useTripStore from '../store/tripStore';
import { activities as allActivities } from '../data/activities';
import { useBudget } from '../hooks/useBudget';

export default function ItineraryViewPage() {
  const { tripId } = useParams();
  const [view, setView] = useState('list');
  const { trips, stops } = useTripStore();
  const trip = trips.find(t => t.id === tripId) || trips[0];
  const tripStops = stops.filter(s => s.tripId === (trip?.id));
  const budget = useBudget(tripStops, trip?.totalBudget || 0);

  const dayCount = trip ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000*60*60*24)) + 1 : 0;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="section-title text-3xl mb-2">{trip?.name || 'Itinerary'}</h1>
        <p className="section-subtitle">Day-by-day plan with budget insights</p>
      </motion.div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setView('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'list' ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
          <List size={14} /> List View
        </button>
        <button onClick={() => setView('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'calendar' ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
          <CalendarDays size={14} /> Calendar View
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Itinerary */}
        <div className="flex-1 space-y-4">
          {tripStops.map((stop, si) => {
            const acts = stop.activities.map(aId => allActivities.find(a => a.id === aId)).filter(Boolean);
            const nights = Math.ceil((new Date(stop.endDate) - new Date(stop.startDate)) / (1000*60*60*24));
            return (
              <motion.div key={stop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}
                className="glass-card overflow-hidden">
                <div className="bg-gradient-to-r from-primary/30 to-transparent p-4 border-b border-white/5">
                  <h3 className="font-display font-bold text-lg">Day {si * 2 + 1}–{si * 2 + nights} · {stop.cityName}</h3>
                  <p className="text-text-secondary text-xs font-mono">
                    {new Date(stop.startDate).toLocaleDateString()} — {new Date(stop.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Activities</h4>
                      <div className="space-y-2">
                        {acts.map((a, ai) => (
                          <div key={a.id} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                            <div className="flex-1">
                              <p className="text-sm text-text-primary">{a.name}</p>
                              <p className="text-xs text-text-secondary">{a.duration} · {a.category}</p>
                            </div>
                            <span className="font-mono text-xs text-accent">${a.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Expenses</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Accommodation ({nights}n)</span>
                          <span className="font-mono text-text-primary">${(nights * 150).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Activities</span>
                          <span className="font-mono text-text-primary">${acts.reduce((s, a) => s + a.cost, 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-white/10 pt-2 mt-2">
                          <span className="text-text-primary font-medium">Stop Total</span>
                          <span className="font-mono text-accent font-bold">${(nights * 150 + acts.reduce((s, a) => s + a.cost, 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {si < tripStops.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown size={16} className="text-accent/40" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Right: Budget */}
        <div className="lg:w-80">
          <div className="glass-card p-5 sticky top-20">
            <h3 className="font-display font-semibold text-lg mb-4">Budget Insights</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between"><span className="text-text-secondary text-sm">Total Budget</span><span className="font-mono font-bold text-text-primary">${(trip?.totalBudget || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary text-sm">Total Spent</span><span className="font-mono font-bold text-warning">${budget.totalSpent.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary text-sm">Remaining</span><span className={`font-mono font-bold ${budget.remaining >= 0 ? 'text-success' : 'text-danger'}`}>${budget.remaining.toLocaleString()}</span></div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full transition-all ${budget.percentage > 90 ? 'bg-danger' : budget.percentage > 70 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}></div>
              </div>
            </div>
            {budget.chartData.length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={budget.chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {budget.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F0FF' }}
                      formatter={(value) => [`$${value}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-2 mt-4">
              {budget.chartData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-text-secondary flex-1">{item.name}</span>
                  <span className="text-xs font-mono text-text-primary">${item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
