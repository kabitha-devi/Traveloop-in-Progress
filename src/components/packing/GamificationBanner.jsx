import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertCircle, Sparkles, Target } from 'lucide-react';

export default function GamificationBanner({ gamificationData, loading, packedCount, totalCount }) {
  if (totalCount === 0) return null;

  const progress = Math.round((packedCount / totalCount) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
          <Sparkles className="animate-pulse text-accent" />
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary font-medium">Packing Progress</span>
          <span className="text-accent font-bold font-mono">{progress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {gamificationData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {gamificationData.urgency_message && (
              <div className="flex items-center gap-2 text-warning text-xs bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/20">
                <AlertCircle size={14} />
                <span>{gamificationData.urgency_message}</span>
              </div>
            )}
            <p className="text-sm font-medium">{gamificationData.progress_message}</p>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles size={12} className="text-primary" /> Daily Tip
              </p>
              <p className="text-xs italic">"{gamificationData.packing_tip_of_day}"</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 bg-gradient-to-br from-accent/20 to-primary/10 p-3 rounded-lg border border-accent/30 text-center">
                <div className="text-2xl mb-1">{gamificationData.current_badge.emoji}</div>
                <div className="text-xs font-bold text-accent">{gamificationData.current_badge.name}</div>
                <div className="text-[10px] text-text-secondary">Current Status</div>
              </div>
              <div className="flex-1 bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-70">
                <div className="text-2xl mb-1 grayscale">{gamificationData.next_badge.emoji}</div>
                <div className="text-xs font-bold">{gamificationData.next_badge.name}</div>
                <div className="text-[10px] text-text-secondary">{gamificationData.next_badge.items_remaining} items left</div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg flex items-center gap-3">
              <div className="bg-primary/20 p-1.5 rounded text-primary"><Target size={16} /></div>
              <div>
                <p className="text-xs font-bold">Challenge: {gamificationData.challenge.title}</p>
                <p className="text-[10px] text-text-secondary">Reward: {gamificationData.challenge.reward}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
