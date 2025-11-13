import { useEffect, useRef, useState } from 'react';

export function useScrollToBottom<T = HTMLDivElement>(deps: any[] = []) {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    const container = containerRef.current as any;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    } else {
      (endRef.current as any)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auto-scroll on dependency changes
  useEffect(() => {
    scrollToBottom();
  }, deps);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current as any;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && deps[0] > 0);
    };

    const container = containerRef.current as any;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, deps);

  return { containerRef, endRef, showScrollButton, scrollToBottom };
}
