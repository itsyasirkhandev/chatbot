'use client';

interface SkeletonLoaderProps {
  showThinkingSection?: boolean;
}

export function SkeletonLoader({ showThinkingSection = false }: SkeletonLoaderProps) {
  return (
    <div className="animate-fade-in" role="status" aria-label="Loading response">
      {showThinkingSection && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3.5 h-3.5 rounded-full bg-gray-400 animate-pulse"></div>
            <div className="w-24 h-3.5 bg-gray-400 rounded animate-pulse"></div>
          </div>
          <div className="bg-gray-50 border-l-4 border-gray-400 pl-4 pr-3 py-3 rounded-r space-y-2.5">
            <div className="w-full h-3 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-11/12 h-3 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '75ms' }}></div>
            <div className="w-10/12 h-3 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-9/12 h-3 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '225ms' }}></div>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <div className="w-full h-3.5 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-11/12 h-3.5 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '75ms' }}></div>
        <div className="w-10/12 h-3.5 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3/4 h-3.5 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '225ms' }}></div>
      </div>

      <span className="sr-only">Loading response from AI...</span>
    </div>
  );
}
