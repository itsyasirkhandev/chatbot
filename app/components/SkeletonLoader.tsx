'use client';

export function SkeletonLoader() {
  return (
    <div className="flex items-center gap-3 py-3" role="status" aria-label="Loading response">
      {/* Circular spinner loader - blue color matching primary theme */}
      <div 
        style={{ 
          width: '20px',
          height: '20px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3B82F6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block'
        }}
      />
      <span className="text-sm text-muted-foreground">
        Generating response...
      </span>
    </div>
  );
}
