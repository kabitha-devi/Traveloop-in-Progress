import { Flame, Loader2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrendingSidebar({ trending, loading }) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="lg:w-80 flex-shrink-0 space-y-6">
      <div className="glass-card p-5 sticky top-24">
        <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
          <Flame size={18} className="text-warning" /> Trending for {currentMonth}
        </h3>
        <p className="text-xs text-text-secondary mb-5">Powered by live web search</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-3 items-center animate-pulse">
                <div className="w-4 h-4 bg-white/10 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  <div className="h-2 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {trending?.map((dest, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 group"
              >
                <span className="font-mono text-sm text-warning font-bold w-4 mt-0.5">{dest.rank}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors flex items-center gap-1">
                      {dest.city}, {dest.country} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <span className="text-[10px] text-text-secondary bg-white/5 px-1.5 py-0.5 rounded">{dest.travel_style}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{dest.trend_reason}</p>
                  <div className="flex gap-3 mt-2 text-[10px] text-text-secondary/70">
                    <span>{dest.community_posts} posts</span>
                    <span>•</span>
                    <span>{dest.avg_trip_cost}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
