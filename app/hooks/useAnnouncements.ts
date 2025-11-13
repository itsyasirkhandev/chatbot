import { useState } from 'react';

export function useAnnouncements() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (text: string) => {
    setAnnouncement(text);
    setTimeout(() => setAnnouncement(''), 100);
  };

  return { announcement, announce };
}
