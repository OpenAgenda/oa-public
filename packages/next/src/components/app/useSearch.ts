'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useLocalePath from 'app/utils/useLocalePath';

export default function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const localePath = useLocalePath();

  const urlSearch = searchParams.get('search') ?? '';
  const [inputValue, setInputValue] = useState(urlSearch);

  // Sync input when URL changes (back/forward, external navigation)
  useEffect(() => {
    setInputValue(urlSearch);
  }, [urlSearch]);

  const onSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const target = e.target as typeof e.target & {
        search: { value: string };
      };

      const searchValue = target.search.value;
      const params = new URLSearchParams();
      if (searchValue) params.set('search', searchValue);

      router.push(localePath(`/agendas${params.size ? `?${params}` : ''}`));
    },
    [router, localePath],
  );

  return useMemo(
    () => ({
      inputValue,
      setInputValue,
      onSearch,
    }),
    [inputValue, onSearch],
  );
}
