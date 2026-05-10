import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useUiStore from '../../store/uiStore';

export default function Modal() {
  const { modalOpen, modalContent, closeModal } = useUiStore();

  return (
    <AnimatePresence>
      {modalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[91] flex items-center justify-center p-4"
          >
            <div className="glass-card p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 btn-ghost p-2"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              {modalContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
