import { useState } from 'react';
import { X, Sparkles, Loader2, MessageSquare, Image as ImageIcon, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { communityApi } from '../../utils/api';
import useToast from '../../hooks/useToast';

export default function CommunityToolsModals({ activeModal, setActiveModal }) {
  const toast = useToast();
  
  // Review State
  const [reviewText, setReviewText] = useState('');
  const [reviewTrip, setReviewTrip] = useState('Bali Getaway');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAnalysis, setReviewAnalysis] = useState(null);
  
  // Caption State
  const [captionDest, setCaptionDest] = useState('Kyoto, Japan');
  const [captionNote, setCaptionNote] = useState('Saw monkeys and ate matcha.');
  const [captionData, setCaptionData] = useState(null);
  
  const [loading, setLoading] = useState(false);

  const handleAnalyzeReview = async () => {
    if (!reviewText) return;
    setLoading(true);
    setReviewAnalysis(null);
    try {
      const data = await communityApi.analyzeReview({
        tripTitle: reviewTrip,
        destinations: [reviewTrip],
        reviewText,
        rating: reviewRating
      });
      setReviewAnalysis(data);
    } catch (err) {
      toast.error('Failed to analyze review');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCaption = async () => {
    setLoading(true);
    setCaptionData(null);
    try {
      const data = await communityApi.generateCaption({
        mediaType: 'photo',
        destination: captionDest,
        note: captionNote
      });
      setCaptionData(data);
    } catch (err) {
      toast.error('Failed to generate caption');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'review' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="font-display font-bold flex items-center gap-2">
                <MessageSquare size={18} className="text-accent" /> AI Review Analyzer
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={18}/></button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Trip Name</label>
                <input type="text" className="input-field" value={reviewTrip} onChange={e => setReviewTrip(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Your Review</label>
                <textarea rows={3} className="input-field resize-none" placeholder="How was the trip?" value={reviewText} onChange={e => setReviewText(e.target.value)} />
              </div>
              
              <button onClick={handleAnalyzeReview} disabled={loading || !reviewText} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Analyze Review
              </button>

              {reviewAnalysis && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 border-t border-white/10 pt-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-xs text-text-secondary uppercase mb-1 tracking-wider">AI Summary</p>
                    <p className="text-sm">{reviewAnalysis.summary}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {reviewAnalysis.helpful_tags?.map((t, i) => <span key={i} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">{t}</span>)}
                  </div>

                  <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl text-sm text-text-secondary">
                    <span className="font-bold text-primary block mb-1">Suggested Host Reply:</span>
                    "{reviewAnalysis.reply_suggestion}"
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {activeModal === 'caption' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="font-display font-bold flex items-center gap-2">
                <Camera size={18} className="text-primary" /> AI Magic Caption
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={18}/></button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="w-full h-32 bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-text-secondary">
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <span className="text-xs">Mock Photo Uploaded</span>
              </div>
              
              <div>
                <label className="block text-xs text-text-secondary mb-1">Destination</label>
                <input type="text" className="input-field" value={captionDest} onChange={e => setCaptionDest(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Rough Notes (Optional)</label>
                <input type="text" className="input-field" placeholder="e.g., ate pizza, saw tower" value={captionNote} onChange={e => setCaptionNote(e.target.value)} />
              </div>
              
              <button onClick={handleGenerateCaption} disabled={loading} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Caption
              </button>

              {captionData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 border-t border-white/10 pt-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm font-medium mb-3">"{captionData.suggested_caption}"</p>
                    <p className="text-xs text-accent mb-2">{captionData.hashtags?.join(' ')}</p>
                    <div className="flex gap-2 text-[10px] text-text-secondary uppercase">
                      <span className="bg-black/40 px-2 py-1 rounded border border-white/5">📍 {captionData.location_tag_suggestion}</span>
                      <span className="bg-black/40 px-2 py-1 rounded border border-white/5">🎭 Mood: {captionData.mood}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
