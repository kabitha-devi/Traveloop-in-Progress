import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw, Share2, Package, Sparkles, Loader2, CloudSun } from 'lucide-react';
import useChecklistStore from '../store/checklistStore';
import useTripStore from '../store/tripStore';
import useToast from '../hooks/useToast';
import { packingApi } from '../utils/api';

import GamificationBanner from '../components/packing/GamificationBanner';
import SmartAddons from '../components/packing/SmartAddons';
import ShareModal from '../components/packing/ShareModal';

export default function ChecklistPage() {
  const { trips } = useTripStore();
  const { checklists, toggleItem, addItem, resetChecklist, createChecklist } = useChecklistStore();
  const toast = useToast();
  
  const [selectedTrip, setSelectedTrip] = useState(trips[0]?.id || '');
  const [newItem, setNewItem] = useState({ label: '', category: 'Documents' });
  const [showAdd, setShowAdd] = useState(false);
  
  // Loading states
  const [aiLoading, setAiLoading] = useState(false);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [gamifyLoading, setGamifyLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // AI Data states
  const [tripSummary, setTripSummary] = useState(null);
  const [weatherNote, setWeatherNote] = useState(null);
  const [addonsData, setAddonsData] = useState(null);
  const [gamifyData, setGamifyData] = useState(null);
  const [shareData, setShareData] = useState(null);

  const prevPackedRef = useRef(0);

  let checklist = checklists.find(cl => cl.tripId === selectedTrip);
  const items = checklist?.items || [];
  const packed = items.filter(i => i.packed).length;
  const categories = [...new Set(items.map(i => i.category))];
  const activeTrip = trips.find(t => t.id === selectedTrip);

  // --- Gamification Effect ---
  // When packed count changes, if it goes up or down significantly, fetch gamification
  useEffect(() => {
    if (!activeTrip || items.length === 0) return;
    
    // Simple throttle: only fetch gamify data if we packed a new item
    // and don't do it on every single click to avoid spam (in a real app you'd debounce)
    if (packed !== prevPackedRef.current && packed > 0) {
      prevPackedRef.current = packed;
      setGamifyLoading(true);
      packingApi.gamify({
        tripName: activeTrip.name,
        destinations: activeTrip.stops?.map(s => s.location) || [activeTrip.destination],
        packedCount: packed,
        totalCount: items.length,
        completedCategories: categories.filter(cat => {
          const catItems = items.filter(i => i.category === cat);
          return catItems.length > 0 && catItems.every(i => i.packed);
        }),
        daysUntilTrip: Math.ceil((new Date(activeTrip.startDate) - new Date()) / (1000 * 60 * 60 * 24))
      })
      .then(setGamifyData)
      .catch(console.error)
      .finally(() => setGamifyLoading(false));
    }
  }, [packed, items.length, activeTrip, categories]);

  const handleAdd = () => {
    if (!newItem.label.trim()) return;
    let checklistId = checklist?.id;
    if (!checklistId) checklistId = createChecklist(selectedTrip).id;
    addItem(checklistId, newItem);
    setNewItem({ label: '', category: 'Documents' });
    setShowAdd(false);
    toast.success('Item added!');
  };

  const handleAIPacking = async () => {
    if (!activeTrip) { toast.warning('Select a trip first'); return; }
    setAiLoading(true);
    setTripSummary(null);
    setWeatherNote(null);
    try {
      // 1. Core Packing List
      const destinations = activeTrip.stops?.length ? activeTrip.stops.map(s => s.location) : [activeTrip.destination];
      const result = await packingApi.generate({
        tripName: activeTrip.name,
        destinations,
        duration: activeTrip.days,
        travelStyle: activeTrip.mood || 'Standard',
        travelMonth: new Date(activeTrip.startDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
        activitiesList: activeTrip.activities || [],
        travelerType: 'Solo', // Can be parameterized later
        budget: activeTrip.budget || 'Mid-range'
      });

      setTripSummary(result.trip_summary);
      setWeatherNote(result.weather_note);

      let checklistId = checklist?.id;
      if (!checklistId) checklistId = createChecklist(selectedTrip).id;

      let addedCount = 0;
      if (result.categories) {
        for (const cat of result.categories) {
          for (const item of cat.items) {
            const existing = items.find(i => i.label.toLowerCase() === item.name.toLowerCase());
            if (!existing) {
              addItem(checklistId, {
                label: item.name,
                category: cat.name,
                essential: item.priority === 'Must-have',
                reason: item.why,
              });
              addedCount++;
            }
          }
        }
      }
      toast.success(`✨ AI generated ${addedCount} tailored items!`);

      // 2. Fetch Smart Add-ons immediately after
      setAddonsLoading(true);
      const addons = await packingApi.addons({
        destinations,
        duration: activeTrip.days,
        activities: activeTrip.activities || [],
        existingItems: result.categories.map(c => c.items.map(i => i.name)).flat()
      });
      setAddonsData(addons);

    } catch (error) {
      toast.error(error.message || 'AI packing failed');
    } finally {
      setAiLoading(false);
      setAddonsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!activeTrip || items.length === 0) {
      toast.warning('Generate or add items before sharing!');
      return;
    }
    setShareLoading(true);
    try {
      const packedItems = items.filter(i => i.packed).map(i => i.label);
      const unpackedItems = items.filter(i => !i.packed).map(i => i.label);
      const res = await packingApi.share({
        tripName: activeTrip.name,
        destinations: activeTrip.stops?.map(s => s.location) || [activeTrip.destination],
        packedItems,
        unpackedItems
      });
      setShareData(res);
    } catch (err) {
      toast.error('Failed to generate share summary');
    } finally {
      setShareLoading(false);
    }
  };

  const handleAddAddon = (addon) => {
    let checklistId = checklist?.id;
    if (!checklistId) checklistId = createChecklist(selectedTrip).id;
    addItem(checklistId, {
      label: addon.name,
      category: addon.category || 'Gear',
      essential: false,
      reason: addon.why,
    });
  };

  return (
    <div className="page-container max-w-3xl pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-6">
        <div>
          <h1 className="section-title text-3xl mb-2 flex items-center gap-2">Smart Checklist</h1>
          <p className="section-subtitle">Personalized packing for your exact itinerary.</p>
        </div>
        <button onClick={handleShare} disabled={shareLoading} className="btn-secondary flex items-center gap-2 text-sm bg-white/5 border border-white/10">
          {shareLoading ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
          Share List
        </button>
      </motion.div>

      {/* Trip Selector */}
      <div className="glass-card p-4 mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm text-text-secondary mb-2">Packing For</label>
          <select value={selectedTrip} onChange={e => setSelectedTrip(e.target.value)} className="input-field">
            {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <button onClick={handleAIPacking} disabled={aiLoading} className="btn-primary flex items-center gap-2 text-sm py-3 px-6 h-12 shadow-[0_0_15px_rgba(192,132,252,0.3)]">
          {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Generate List
        </button>
      </div>

      {tripSummary && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 space-y-3">
          <p className="text-sm font-medium italic text-accent border-l-2 border-accent pl-3">{tripSummary}</p>
          {weatherNote && (
            <p className="text-xs text-text-secondary flex items-center gap-1.5 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10">
              <CloudSun size={14} className="text-warning" /> {weatherNote}
            </p>
          )}
        </motion.div>
      )}

      <GamificationBanner gamificationData={gamifyData} loading={gamifyLoading} packedCount={packed} totalCount={items.length} />

      <SmartAddons addons={addonsData} loading={addonsLoading} onAdd={handleAddAddon} />

      {/* Categorized Items */}
      <div className="space-y-6 mb-8">
        {categories.map(cat => (
          <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-accent" />
              <h3 className="font-display font-semibold">{cat}</h3>
              <span className="text-xs font-mono text-text-secondary ml-auto bg-black/30 px-2 py-0.5 rounded border border-white/5">
                {items.filter(i => i.category === cat && i.packed).length}/{items.filter(i => i.category === cat).length}
              </span>
            </div>
            <div className="space-y-1.5">
              {items.filter(i => i.category === cat).map(item => (
                <label key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={item.packed} onChange={() => toggleItem(checklist.id, item.id)}
                    className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-accent focus:ring-accent accent-[#C084FC]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm transition-all ${item.packed ? 'line-through text-text-secondary/40' : 'text-text-primary'}`}>
                        {item.label}
                      </span>
                      {item.essential && <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">Must</span>}
                    </div>
                    {item.reason && <p className={`text-xs mt-1 transition-all ${item.packed ? 'text-text-secondary/30' : 'text-text-secondary'}`}>{item.reason}</p>}
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        ))}
        {items.length === 0 && !aiLoading && (
          <div className="text-center py-12 text-text-secondary glass-card border-dashed">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p>Your checklist is empty.</p>
            <p className="text-sm mt-1">Click "Generate List" to let AI do the work!</p>
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-4 mb-4 border border-accent/20">
            <div className="flex gap-2">
              <input type="text" value={newItem.label} onChange={e => setNewItem(p => ({...p, label: e.target.value}))}
                placeholder="Custom item name..." className="input-field text-sm flex-1" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <select value={newItem.category} onChange={e => setNewItem(p => ({...p, category: e.target.value}))} className="input-field text-sm w-36">
                {['Documents', 'Clothing', 'Electronics', 'Toiletries', 'Gear'].map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={handleAdd} className="btn-primary text-sm px-4">Add</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Actions */}
      <div className="flex gap-3 justify-center">
        <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2 text-sm bg-white/5 border border-white/10 hover:bg-white/10">
          <Plus size={14} /> Add Custom Item
        </button>
        {items.length > 0 && (
          <button onClick={() => { if (checklist) { resetChecklist(checklist.id); toast.info('Checklist reset'); } }}
            className="text-text-secondary hover:text-white flex items-center gap-2 text-sm px-4">
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      <ShareModal shareData={shareData} onClose={() => setShareData(null)} />
    </div>
  );
}
