import { motion } from 'framer-motion';
import { Lightbulb, ShoppingBag, Plus } from 'lucide-react';
import useToast from '../../hooks/useToast';

export default function SmartAddons({ addons, onAdd, loading }) {
  const toast = useToast();

  if (loading) {
    return (
      <div className="glass-card p-5 mb-6 animate-pulse h-40 rounded-xl border border-accent/20"></div>
    );
  }

  if (!addons || addons.length === 0) return null;

  const handleAdd = (addon) => {
    onAdd(addon);
    toast.success(`Added ${addon.name} to your list!`);
  };

  const getSurpriseColor = (factor) => {
    switch(factor) {
      case 'Life-saver': return 'bg-danger/20 text-danger border-danger/30';
      case 'Smart': return 'bg-accent/20 text-accent border-accent/30';
      case 'Unexpected': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6 border border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} className="text-accent" />
        <h3 className="font-display font-semibold">Smart Add-Ons</h3>
        <span className="text-xs text-text-secondary ml-2">Clever ideas for your trip</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addons.map((addon, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl hover:border-accent/30 transition-colors group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm text-text-primary">{addon.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getSurpriseColor(addon.surprise_factor)}`}>
                  {addon.surprise_factor}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-snug mb-2">{addon.why}</p>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <a 
                href={`https://www.amazon.com/s?k=${encodeURIComponent(addon.buy_link_search)}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] flex items-center gap-1 text-text-secondary hover:text-white transition-colors"
              >
                <ShoppingBag size={10} /> ~{addon.estimated_cost}
              </a>
              <button onClick={() => handleAdd(addon)} className="text-xs text-accent hover:bg-accent/10 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
