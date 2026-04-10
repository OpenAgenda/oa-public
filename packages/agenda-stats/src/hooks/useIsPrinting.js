import { useEffect, useState } from 'react';

export default function useIsPrinting() {
  const [isPrinting, setIsPrinting] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('print').matches ?? false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onBefore = () => setIsPrinting(true);
    const onAfter = () => setIsPrinting(false);

    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);

    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
    };
  }, []);

  return isPrinting;
}
