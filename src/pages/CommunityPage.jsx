import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Camera } from 'lucide-react';
import { communityApi } from '../utils/api';
import useAuthStore from '../store/authStore';

import InspirationBanner from '../components/community/InspirationBanner';
import FeedList from '../components/community/FeedList';
import TrendingSidebar from '../components/community/TrendingSidebar';
import CommunityToolsModals from '../components/community/CommunityToolsModals';

export default function CommunityPage() {
  const { user } = useAuthStore();
  
  // Data states
  const [feed, setFeed] = useState(null);
  const [trending, setTrending] = useState(null);
  const [inspirations, setInspirations] = useState(null);
  
  // Loading states
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingInsp, setLoadingInsp] = useState(true);
  
  // Modal state
  const [activeModal, setActiveModal] = useState(null); // 'review' | 'caption' | null

  useEffect(() => {
    // 1. Fetch Feed
    communityApi.getFeed(10)
      .then(setFeed)
      .catch(console.error)
      .finally(() => setLoadingFeed(false));

    // 2. Fetch Trending Destinations (pass current month)
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    communityApi.getTrending(currentMonth)
      .then(setTrending)
      .catch(console.error)
      .finally(() => setLoadingTrending(false));

    // 3. Fetch Inspiration
    communityApi.getInspiration({
      homeCity: user?.location || 'Unknown',
      interests: 'General travel',
      budget: 'Moderate'
    })
      .then(setInspirations)
      .catch(console.error)
      .finally(() => setLoadingInsp(false));
  }, [user]);

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title text-4xl mb-2">Community</h1>
          <p className="section-subtitle">Get inspired, discover trends, and share your journey.</p>
        </motion.div>
        
        {/* Interactive Tools Buttons */}
        <div className="flex gap-3">
          <button onClick={() => setActiveModal('review')} className="btn-ghost flex items-center gap-2 border border-white/10 hover:border-accent">
            <MessageSquare size={16} className="text-accent" /> Write Review
          </button>
          <button onClick={() => setActiveModal('caption')} className="btn-primary flex items-center gap-2">
            <Camera size={16} /> Post Photo
          </button>
        </div>
      </div>

      <InspirationBanner inspirations={inspirations} loading={loadingInsp} />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <FeedList feed={feed} loading={loadingFeed} />
        <TrendingSidebar trending={trending} loading={loadingTrending} />
      </div>

      <CommunityToolsModals activeModal={activeModal} setActiveModal={setActiveModal} />
    </div>
  );
}
