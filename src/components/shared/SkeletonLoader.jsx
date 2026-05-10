export function SkeletonCard() {
  return (
    <div className="glass-card p-4 space-y-3 animate-pulse">
      <div className="skeleton h-40 w-full rounded-xl"></div>
      <div className="skeleton h-4 w-3/4 rounded"></div>
      <div className="skeleton h-3 w-1/2 rounded"></div>
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-6 w-16 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-3 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return <div className={`skeleton rounded-full ${sizes[size]}`}></div>;
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6 space-y-4 animate-pulse">
      <div className="skeleton h-4 w-1/3 rounded"></div>
      <div className="skeleton h-48 w-full rounded-xl"></div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4 animate-pulse">
          <div className="skeleton w-12 h-12 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/2 rounded"></div>
            <div className="skeleton h-3 w-1/3 rounded"></div>
          </div>
          <div className="skeleton h-8 w-20 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}
