'use client';

import BaseNavbar from 'components/Navbar/BaseNavbar';
import LanguageSelector from './LanguageSelector';
import useSearch from './useSearch';

export default function AppNavbar(
  props: Omit<
    React.ComponentProps<typeof BaseNavbar>,
    'search' | 'LanguageSelector'
  >,
) {
  const search = useSearch();

  return (
    <BaseNavbar
      {...props}
      search={search}
      LanguageSelector={LanguageSelector}
    />
  );
}
