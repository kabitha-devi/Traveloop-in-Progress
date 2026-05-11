import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function ShareModal({ shareData, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!shareData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareData.share_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="font-display font-bold flex items-center gap-2">
              <Share2 size={18} className="text-primary" /> Share List
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg"><X size={18}/></button>
          </div>
          
          <div className="p-5 flex flex-col items-center text-center">
            <h3 className="font-display font-bold text-xl mb-1">{shareData.share_title}</h3>
            <p className="text-sm text-text-secondary mb-4">{shareData.share_description}</p>

            <div className="bg-white/5 w-full p-4 rounded-xl border border-white/10 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{shareData.readiness_label}</span>
                <span className="text-sm font-mono text-accent">{shareData.readiness_score}%</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-accent" style={{ width: `${shareData.readiness_score}%` }}></div>
              </div>
              <p className="text-xs text-text-secondary">{shareData.packed_summary}</p>
            </div>

            {shareData.missing_essentials?.length > 0 && (
              <div className="w-full text-left mb-4">
                <p className="text-xs font-bold text-warning mb-1 uppercase tracking-wider">Still Need to Pack:</p>
                <div className="flex flex-wrap gap-1.5">
                  {shareData.missing_essentials.map(item => (
                    <span key={item} className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded border border-warning/20">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full bg-black/30 p-3 rounded-lg border border-white/5 relative group mb-4">
              <p className="text-xs text-left text-text-secondary leading-relaxed">{shareData.share_text}</p>
              <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-white/10 p-1.5 rounded-md hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
              >
                {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            <button onClick={handleCopy} className="btn-primary w-full py-2 flex items-center justify-center gap-2">
              {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
              {copied ? 'Copied to Clipboard' : 'Copy Share Text'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
