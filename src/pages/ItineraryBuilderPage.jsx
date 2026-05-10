import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { GripVertical, Plus, Trash2, Save, MapPin, Calendar, Wallet, Clock, CloudRain, Loader2, Sparkles } from 'lucide-react';
import useTripStore from '../store/tripStore';
import useToast from '../hooks/useToast';
import { aiApi } from '../utils/api';

export default function ItineraryBuilderPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { trips, stops, addStop, updateStop, deleteStop } = useTripStore();
  const trip = trips.find(t => t.id === tripId);
  const tripStops = stops.filter(s => s.tripId === tripId);
  const [weatherReschedule, setWeatherReschedule] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const handleWeatherReschedule = async () => {
    setWeatherLoading(true);
    try {
      const data = await aiApi.weatherReschedule(tripId);
      setWeatherReschedule(data);
      toast.success('Weather analysis complete! 🌧️');
    } catch (error) {
      toast.error('Failed to analyze weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const [sections, setSections] = useState(() => 
    tripStops.length > 0 
      ? tripStops.map(s => ({
          id: s.id,
          cityName: s.cityName,
          country: s.country || '',
          description: `Travel to ${s.cityName}`,
          startDate: s.startDate,
          endDate: s.endDate,
          budget: s.budget,
        }))
      : [{ id: 'new-1', cityName: '', country: '', description: '', startDate: '', endDate: '', budget: 0 }]
  );

  const addSection = () => {
    setSections(prev => [...prev, {
      id: `new-${Date.now()}`,
      cityName: '',
      country: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: 0,
    }]);
  };

  const updateSection = (id, field, value) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id) => {
    if (sections.length <= 1) {
      toast.warning('You need at least one section');
      return;
    }
    setSections(prev => prev.filter(s => s.id !== id));
    if (!id.startsWith('new-')) {
      deleteStop(id);
    }
  };

  const handleSave = () => {
    sections.forEach(section => {
      if (section.id.startsWith('new-')) {
        if (section.cityName) {
          addStop({
            tripId,
            cityName: section.cityName,
            country: section.country,
            startDate: section.startDate,
            endDate: section.endDate,
            budget: parseInt(section.budget) || 0,
          });
        }
      } else {
        updateStop(section.id, {
          cityName: section.cityName,
          country: section.country,
          startDate: section.startDate,
          endDate: section.endDate,
          budget: parseInt(section.budget) || 0,
        });
      }
    });
    toast.success('Itinerary saved! ✈️');
    navigate(`/trips/${tripId}`);
  };

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Builder */}
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="section-title text-3xl mb-2">Build Itinerary</h1>
            <p className="section-subtitle">{trip?.name || 'New Trip'}</p>
          </motion.div>

          <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-4">
            {sections.map((section, index) => (
              <Reorder.Item key={section.id} value={section}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary transition-colors">
                      <GripVertical size={18} />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center">
                      <span className="text-accent font-mono text-sm font-bold">{index + 1}</span>
                    </div>
                    <h3 className="font-display font-semibold text-text-primary flex-1">
                      Section {index + 1} {section.cityName && `— ${section.cityName}`}
                    </h3>
                    <button onClick={() => removeSection(section.id)} className="btn-ghost p-1.5 text-danger hover:text-danger" aria-label="Remove section">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-3 pl-11">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">
                          <MapPin size={12} className="inline mr-1" />City
                        </label>
                        <input type="text" value={section.cityName}
                          onChange={(e) => updateSection(section.id, 'cityName', e.target.value)}
                          placeholder="e.g., Paris" className="input-field text-sm py-2" />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Country</label>
                        <input type="text" value={section.country}
                          onChange={(e) => updateSection(section.id, 'country', e.target.value)}
                          placeholder="e.g., France" className="input-field text-sm py-2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Description</label>
                      <textarea value={section.description}
                        onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                        placeholder="Travel section, hotel, or any other activity"
                        rows={2} className="input-field text-sm py-2 resize-none" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">
                          <Calendar size={12} className="inline mr-1" />From
                        </label>
                        <input type="date" value={section.startDate}
                          onChange={(e) => updateSection(section.id, 'startDate', e.target.value)}
                          className="input-field text-sm py-2 font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">
                          <Calendar size={12} className="inline mr-1" />To
                        </label>
                        <input type="date" value={section.endDate}
                          onChange={(e) => updateSection(section.id, 'endDate', e.target.value)}
                          className="input-field text-sm py-2 font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">
                          <Wallet size={12} className="inline mr-1" />Budget
                        </label>
                        <input type="number" value={section.budget}
                          onChange={(e) => updateSection(section.id, 'budget', e.target.value)}
                          placeholder="2000" className="input-field text-sm py-2 font-mono" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 space-y-3">
            <button onClick={addSection} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Plus size={16} /> Add Another Section
            </button>
            <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              <Save size={16} /> Save Itinerary
            </button>
          </motion.div>
        </div>

        {/* Timeline Preview Sidebar */}
        <div className="lg:w-80">
          <div className="glass-card p-5 sticky top-20 mb-4">
            <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Clock size={16} className="text-accent" /> Timeline
            </h3>
            <div className="space-y-4">
              {sections.filter(s => s.cityName).map((section, i) => (
                <div key={section.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    {i < sections.filter(s => s.cityName).length - 1 && (
                      <div className="w-0.5 h-12 bg-accent/30"></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-text-primary">{section.cityName}</p>
                    {section.startDate && section.endDate && (
                      <p className="text-xs text-text-secondary font-mono">
                        {new Date(section.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(section.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                    {section.budget > 0 && (
                      <p className="text-xs text-accent font-mono">${parseInt(section.budget).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
              {sections.filter(s => s.cityName).length === 0 && (
                <p className="text-sm text-text-secondary text-center py-4">Add sections to see timeline</p>
              )}
            </div>
          </div>

          {/* Weather Rescheduling */}
          <div className="glass-card p-4 sticky top-[400px] border border-accent/20">
            <div className="flex items-center gap-2 mb-3">
              <CloudRain size={14} className="text-blue-400" />
              <h4 className="text-sm font-display font-semibold text-text-primary">Weather Smart</h4>
            </div>
            <button onClick={handleWeatherReschedule} disabled={weatherLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2 mb-3">
              {weatherLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Analyze Weather
            </button>
            <AnimatePresence>
              {weatherReschedule && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-2">
                  {weatherReschedule.recommendations?.map((rec, i) => (
                    <div key={i} className="p-2 rounded-lg bg-blue-500/10 text-xs">
                      <p className="text-blue-400 font-medium mb-1">Day {rec.day}: {rec.issue}</p>
                      <p className="text-text-secondary">{rec.suggestion}</p>
                      {rec.affectedActivities && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rec.affectedActivities.map((a, j) => (
                            <span key={j} className="badge bg-white/5 text-text-secondary/60" style={{ fontSize: '10px' }}>{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {weatherReschedule.recommendations?.length === 0 && (
                    <p className="text-xs text-success text-center">✅ All clear!</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
