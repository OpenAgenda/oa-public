'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import qs, { ParsedQs } from 'qs';

export default function useAppLocationQuery(): ParsedQs {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  return useMemo(() => qs.parse(search), [search]);
}
