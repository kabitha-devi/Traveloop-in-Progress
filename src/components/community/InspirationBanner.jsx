import { motion } from 'framer-motion';
import { Sparkles, Map, ChevronRight, Loader2 } from 'lucide-react';

export default function InspirationBanner({ inspirations, loading }) {
  if (loading) {
    return (
      <div className="mb-8 bg-gradient-to-r from-accent/20 to-primary/10 rounded-2xl p-6 border border-accent/20">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-accent" />
          <h2 className="font-display font-bold text-xl">AI Matches For You</h2>
          <Loader2 size={16} className="animate-spin text-text-secondary ml-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 animate-pulse rounded-xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!inspirations || inspirations.length === 0) return null;

  return (
    <div className="mb-8 bg-gradient-to-r from-accent/20 to-primary/10 rounded-2xl p-6 border border-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-accent" />
        <h2 className="font-display font-bold text-xl">AI Matches For You</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inspirations.map((insp, i) => (
          <motion.div 
            key={insp.trip_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 flex flex-col hover:border-accent/40 cursor-pointer group transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {insp.match_score}% Match
              </span>
              <ChevronRight size={16} className="text-text-secondary group-hover:text-accent transition-colors" />
            </div>
            <p className="text-sm text-text-primary mb-2 line-clamp-2">{insp.reason}</p>
            <p className="text-xs text-text-secondary mt-auto bg-black/20 p-2 rounded-lg italic">
              "{" "}{insp.highlight_for_user}"
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
