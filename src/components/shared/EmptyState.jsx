import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({
  icon: Icon = Compass,
  title = 'Nothing here yet',
  description = 'Start by adding your first item.',
  action,
  actionLabel = 'Get Started',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center mb-6 animate-float">
        <Icon size={36} className="text-accent" />
      </div>
      <h3 className="text-xl font-display font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-sm mb-6">{description}</p>
      {action && (
        <button onClick={action} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
