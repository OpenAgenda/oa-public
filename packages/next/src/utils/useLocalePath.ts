'use client';

import { useCallback } from 'react';
import { useIntl } from 'react-intl';

export default function useLocalePath() {
  const { locale } = useIntl();

  return useCallback(
    (path: string) => `/${locale}${path.startsWith('/') ? '' : '/'}${path}`,
    [locale],
  );
}
