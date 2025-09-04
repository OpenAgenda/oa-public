import { useCallback, useEffect, useState } from 'react';

export type SrcLike = string | { src: string } | any;

type Options = {
  src: SrcLike;
  fallbackSrc?: SrcLike;
  onLoad?: (e: React.SyntheticEvent<any>) => void;
  onError?: (e: React.SyntheticEvent<any>) => void;
};

export function useImageWithFallback({
  src,
  fallbackSrc,
  onLoad,
  onError,
}: Options) {
  const [current, setCurrent] = useState<SrcLike>(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  const toNative = useCallback((s: SrcLike): string => {
    if (typeof s === 'string') return s;
    if (
      s
      && typeof s === 'object'
      && 'src' in s
      && typeof (s as any).src === 'string'
    ) {
      return (s as any).src as string;
    }
    return String(s ?? '');
  }, []);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<any>) => {
      const el = e.target as HTMLImageElement | null;
      if (fallbackSrc && el && el.naturalWidth === 0) {
        setCurrent(fallbackSrc);
      }
      onLoad?.(e);
    },
    [fallbackSrc, onLoad],
  );

  const handleError = useCallback(
    (e: React.SyntheticEvent<any>) => {
      if (fallbackSrc) setCurrent(fallbackSrc);
      onError?.(e);
    },
    [fallbackSrc, onError],
  );

  return {
    src: current,
    /** Stringified version for <img> / Chakra Image */
    srcForNative: toNative(current),
    onLoad: handleLoad,
    onError: handleError,
    /** Utils */
    setSrc: setCurrent,
    reset: () => setCurrent(src),
  };
}
