import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, RotateCcw, Share2, Package, Trash2, Sparkles, Loader2 } from 'lucide-react';
import useChecklistStore from '../store/checklistStore';
import useTripStore from '../store/tripStore';
import useToast from '../hooks/useToast';
import { aiApi } from '../utils/api';

export default function ChecklistPage() {
  const { trips } = useTripStore();
  const { checklists, toggleItem, addItem, resetChecklist, createChecklist } = useChecklistStore();
  const toast = useToast();
  const [selectedTrip, setSelectedTrip] = useState(trips[0]?.id || '');
  const [newItem, setNewItem] = useState({ label: '', category: 'Documents' });
  const [showAdd, setShowAdd] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  let checklist = checklists.find(cl => cl.tripId === selectedTrip);
  const items = checklist?.items || [];
  const packed = items.filter(i => i.packed).length;
  const categories = [...new Set(items.map(i => i.category))];

  const handleAdd = () => {
    if (!newItem.label.trim()) return;
    let checklistId = checklist?.id;
    if (!checklistId) {
      const created = createChecklist(selectedTrip);
      checklistId = created.id;
    }
    addItem(checklistId, newItem);
    setNewItem({ label: '', category: 'Documents' });
    setShowAdd(false);
    toast.success('Item added!');
  };

  const handleAIPacking = async () => {
    if (!selectedTrip) { toast.warning('Select a trip first'); return; }
    setAiLoading(true);
    try {
      const trip = trips.find(t => t.id === selectedTrip);
      const result = await aiApi.smartPacking({
        tripName: trip?.name,
        destination: trip?.destination,
        days: trip?.days,
        mood: trip?.mood,
        stops: trip?.stops,
      });

      // Create checklist if it doesn't exist
      let checklistId = checklist?.id;
      if (!checklistId) {
        const created = createChecklist(selectedTrip);
        checklistId = created.id;
      }

      // Add AI-generated items to the checklist
      let addedCount = 0;
      if (result.categories) {
        for (const cat of result.categories) {
          for (const item of cat.items) {
            const existing = items.find(i => i.label.toLowerCase() === item.name.toLowerCase());
            if (!existing) {
              addItem(checklistId, {
                label: item.name,
                category: cat.name,
                essential: item.essential,
                reason: item.reason,
              });
              addedCount++;
            }
          }
        }
      }
      toast.success(`✨ AI added ${addedCount} smart packing items!`);
    } catch (error) {
      toast.error(error.message || 'AI packing failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl mb-2">Packing Checklist</h1>
        <p className="section-subtitle mb-6">Never forget an essential again</p>
      </motion.div>

      {/* Trip Selector */}
      <div className="glass-card p-4 mb-6">
        <label className="block text-sm text-text-secondary mb-2">Select Trip</label>
        <select value={selectedTrip} onChange={e => setSelectedTrip(e.target.value)} className="input-field">
          {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Progress: {packed}/{items.length} items packed</span>
            <span className="font-mono text-sm text-accent">{items.length > 0 ? Math.round((packed / items.length) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${(packed / items.length) * 100}%` }}
              className="h-3 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            />
          </div>
        </motion.div>
      )}

      {/* Categorized Items */}
      <div className="space-y-6 mb-6">
        {categories.map(cat => (
          <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-accent" />
              <h3 className="font-display font-semibold">{cat}</h3>
              <span className="text-xs text-text-secondary ml-auto">
                {items.filter(i => i.category === cat && i.packed).length}/{items.filter(i => i.category === cat).length}
              </span>
            </div>
            <div className="space-y-2">
              {items.filter(i => i.category === cat).map(item => (
                <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={item.packed}
                    onChange={() => { toggleItem(checklist.id, item.id); }}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent focus:ring-accent accent-[#C084FC]" />
                  <span className={`text-sm flex-1 transition-all ${item.packed ? 'line-through text-text-secondary/50' : 'text-text-primary'}`}>
                    {item.label}
                  </span>
                  {item.essential && (
                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">Essential</span>
                  )}
                  {item.reason && (
                    <span className="text-xs text-text-secondary/60 hidden group-hover:inline">{item.reason}</span>
                  )}
                </label>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Item */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 mb-4">
            <div className="flex gap-2">
              <input type="text" value={newItem.label} onChange={e => setNewItem(p => ({...p, label: e.target.value}))}
                placeholder="Item name..." className="input-field text-sm flex-1" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <select value={newItem.category} onChange={e => setNewItem(p => ({...p, category: e.target.value}))} className="input-field text-sm w-36">
                {['Documents', 'Clothing', 'Electronics', 'Toiletries', 'Gear'].map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={handleAdd} className="btn-primary text-sm px-4">Add</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleAIPacking} disabled={aiLoading}
          className="btn-primary flex items-center gap-2 text-sm bg-gradient-to-r from-accent to-primary hover:opacity-90">
          {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          ✨ AI Smart Packing
        </button>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Item
        </button>
        <button onClick={() => { if (checklist) { resetChecklist(checklist.id); toast.info('Checklist reset'); } }}
          className="btn-secondary flex items-center gap-2 text-sm">
          <RotateCcw size={14} /> Reset All
        </button>
        <button onClick={() => toast.success('Checklist shared!')} className="btn-secondary flex items-center gap-2 text-sm">
          <Share2 size={14} /> Share Checklist
        </button>
      </div>
    </div>
  );
}
