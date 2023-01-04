import React, {
  useState,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import { SearchFilter as ReactFiltersSearchFilter } from '@openagenda/react-filters';
import { chakra, HTMLChakraProps } from '@openagenda/uikit';
import SearchInput from 'components/SearchInput';

const StyledSearchInput = chakra(SearchInput);

// Should work but don't autocomplete:
// type ForwardRefComponent<T, P = {}> = ReturnType<typeof React.forwardRef<T, P>>;
type ForwardRefComponent<T, P = {}> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

const SearchFilter = ReactFiltersSearchFilter as ForwardRefComponent<HTMLElement, HTMLChakraProps<'input'> & {
  filter: object;
  isLoading: boolean;
  inputComponent: React.ElementType
}>;

export default function Search({ disabled, isLoading }) {
  const [filter] = useState(() => ({ name: 'search' }));

  return (
    <SearchFilter
      name="search"
      filter={filter}
      isLoading={isLoading}
      disabled={disabled}
      inputComponent={StyledSearchInput}
      minH="50"
      h="50"
      w="full"
      maxW="full"
    />
  );
}
