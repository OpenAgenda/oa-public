import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import useLocationQuery from 'hooks/useLocationQuery';

const navbarSearchContext = createContext(null);

function useNavbarSearchManager() {
  const router = useRouter();
  const query = useLocationQuery();

  const [searchValue, setSearchValue] = useState(query.search ?? '');
  const [inputValue, setInputValue] = useState(searchValue);

  // location change (back)
  useEffect(() => {
    const queryValue = router.query.search ?? '';
    if (queryValue !== searchValue) {
      setSearchValue(decodeURIComponent(queryValue as string));
    }
  }, [router.query, searchValue]);

  return useMemo(() => ({
    searchValue,
    setSearchValue,
    inputValue,
    setInputValue,
  }), [inputValue, searchValue]);
}

export function NavbarSearchProvider({ children }) {
  const value = useNavbarSearchManager();

  return (
    <navbarSearchContext.Provider value={value}>
      {children}
    </navbarSearchContext.Provider>
  );
}

export const useNavbarSearch = () => {
  const context = useContext(navbarSearchContext);
  const [localInputValue, setLocalInputValue] = useState('');

  const inputValue = context ? context.inputValue : localInputValue;
  const setInputValue = context ? context.setInputValue : setLocalInputValue;

  return useMemo(() => ({
    ...context,
    inputValue,
    setInputValue,
  }), [context, inputValue, setInputValue]);
};
