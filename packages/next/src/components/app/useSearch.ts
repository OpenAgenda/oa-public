'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  const onSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const target = e.target as typeof e.target & {
        search: { value: string };
      };

      const qsSearch =
        target.search.value !== ''
          ? `?search=${encodeURIComponent(target.search.value)}`
          : '';

      router.push(`/agendas${qsSearch}`);
    },
    [router],
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
