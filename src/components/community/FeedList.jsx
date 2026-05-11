import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Copy, MapPin, MoreHorizontal, Calendar, Wallet } from 'lucide-react';
import useToast from '../../hooks/useToast';

export default function FeedList({ feed, loading }) {
  const toast = useToast();

  if (loading) {
    return (
      <div className="space-y-6 flex-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card animate-pulse h-96 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!feed || feed.length === 0) return null;

  return (
    <div className="space-y-6 flex-1">
      {feed.map((post, i) => (
        <motion.div 
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card overflow-hidden rounded-2xl"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-${post.user.avatar_color}-500/20 text-${post.user.avatar_color}-400 flex items-center justify-center font-bold text-lg`}>
                {post.user.avatar_initial}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{post.user.name}</h3>
                <p className="text-[10px] text-text-secondary flex items-center gap-1">
                  <MapPin size={10} /> {post.user.location} • {post.user.trips_count} trips
                </p>
              </div>
            </div>
            <button className="text-text-secondary hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Media (Assuming only 1 photo for simplicity) */}
          <div className="relative h-64 sm:h-80 bg-black">
            <img 
              src={`https://source.unsplash.com/800x600/?${encodeURIComponent(post.media[0]?.location_tag || post.trip.destinations[0] || 'travel')}`}
              alt={post.media[0]?.placeholder_description}
              className="w-full h-full object-cover opacity-90"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'; }}
            />
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] flex items-center gap-1">
              <MapPin size={10} className="text-accent" /> {post.media[0]?.location_tag}
            </div>
            {/* Rating floating badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              ⭐ {post.rating}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="font-display font-bold text-xl mb-1">{post.trip.title}</h2>
                <p className="text-sm text-text-secondary">{post.trip.tagline}</p>
              </div>
              <div className="flex gap-2 text-text-secondary">
                <button className="hover:text-danger transition-colors p-1"><Heart size={20} /></button>
                <button className="hover:text-accent transition-colors p-1"><MessageCircle size={20} /></button>
                <button className="hover:text-accent transition-colors p-1"><Bookmark size={20} /></button>
              </div>
            </div>

            {post.media[0]?.caption && (
              <p className="text-sm text-text-primary mb-4">
                <span className="font-semibold mr-2">{post.user.name}</span>
                {post.media[0].caption}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] text-accent bg-accent/10 px-2 py-1 rounded-md">#{tag}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3 rounded-xl mb-4 text-xs">
              <div><span className="text-text-secondary block text-[10px]">Style</span>{post.trip.travel_style}</div>
              <div><span className="text-text-secondary block text-[10px]">Duration</span>{post.trip.days} days</div>
              <div><span className="text-text-secondary block text-[10px]"><Calendar size={10} className="inline mr-1" />When</span>{post.trip.month_year}</div>
              <div><span className="text-text-secondary block text-[10px]"><Wallet size={10} className="inline mr-1" />Budget</span>{post.budget_per_person}</div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Highlights</h4>
              <ul className="text-sm space-y-1">
                {post.highlights.map((h, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-accent mt-0.5">•</span> {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="text-[10px] text-text-secondary font-medium">
                {post.stats.likes} likes • {post.stats.comments} comments
              </div>
              <button 
                onClick={() => toast.success(`Added ${post.trip.title} to your trips!`)}
                className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
              >
                <Copy size={12} /> Save Itinerary
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
