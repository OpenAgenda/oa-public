import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useNavbarSearch } from 'contexts/NavbarSearchManager';

export default function useSearch() {
  const router = useRouter();
  const {
    inputValue,
    setInputValue,
    searchValue,
    setSearchValue,
  } = useNavbarSearch();

  const onSearch = useCallback(e => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      search: { value: string }
    };

    const qsSearch = target.search.value !== '' ? `?search=${encodeURIComponent(target.search.value)}` : '';

    if (typeof setSearchValue === 'function') {
      return router.push(qsSearch, null, { shallow: true });
    }

    router.push(`/agendas${qsSearch}`);
  }, [router, setSearchValue]);

  return useMemo(() => ({
    inputValue,
    setInputValue,
    searchValue,
    setSearchValue,
    onSearch,
  }), [inputValue, onSearch, searchValue, setInputValue, setSearchValue]);
}
