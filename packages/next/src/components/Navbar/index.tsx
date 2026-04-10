import LanguageSelector from './LanguageSelector';
import useSearch from './useSearch';
import BaseNavbar from './BaseNavbar';

export default function Navbar(
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
