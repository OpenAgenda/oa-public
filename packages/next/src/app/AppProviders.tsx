'use client';

import { useState, useRef, useMemo } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { Cookies } from 'react-cookie';
import { createEmotionCache, type EmotionCache } from '@openagenda/uikit';
import Providers from 'Providers';
import SentryErrorBoundary from 'components/SentryErrorBoundary';
import ChunkErrorListener from 'components/ChunkErrorListener';
import useMatomoTracker from 'hooks/useMatomoTracker';
import useAppMatomoPageTracker from 'hooks/useAppMatomoPageTracker';

function useEmotionCache(): EmotionCache {
  const [cache] = useState(() => {
    const c = createEmotionCache();
    (c as any).compat = true;
    return c;
  });

  const inserted = useRef(new Set<string>());

  useServerInsertedHTML(() => {
    const entries = Object.entries(cache.inserted);
    if (entries.length === 0) return null;

    let styles = '';
    const names: string[] = [];

    for (const [name, value] of entries) {
      if (inserted.current.has(name)) continue;
      inserted.current.add(name);
      if (typeof value === 'string') {
        styles += value;
        names.push(name);
      }
    }

    if (!styles) return null;

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return cache;
}

export default function AppProviders({
  locale,
  intlMessages,
  cookieHeader,
  children,
}: {
  locale: string;
  intlMessages: Record<string, string>;
  cookieHeader?: string;
  children: React.ReactNode;
}) {
  const cache = useEmotionCache();
  const cookies = useMemo(() => new Cookies(cookieHeader), [cookieHeader]);

  useMatomoTracker();
  useAppMatomoPageTracker();

  return (
    <Providers
      locale={locale}
      intlMessages={intlMessages}
      cache={cache}
      cookies={cookies}
    >
      <ChunkErrorListener>
        <SentryErrorBoundary>{children}</SentryErrorBoundary>
      </ChunkErrorListener>
    </Providers>
  );
}
