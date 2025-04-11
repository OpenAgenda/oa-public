import React, {
  useState,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import { SearchFilter as ReactFiltersSearchFilter } from '@openagenda/react-filters';
import { Button, HTMLChakraProps, Input, InputGroup } from '@openagenda/uikit';
// import { InputGroup } from '@openagenda/uikit/snippets';
import { useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';
import messages from '../messages';

// Should work but don't autocomplete:
// type ForwardRefComponent<T, P = {}> = ReturnType<typeof React.forwardRef<T, P>>;
type ForwardRefComponent<T, P = {}> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>;

const TypedSearchFilter = ReactFiltersSearchFilter as ForwardRefComponent<
  HTMLElement,
  HTMLChakraProps<'input'> & {
    filter: object;
    isLoading: boolean;
    inputComponent: React.ElementType;
  }
>;

type NavbarSearchInputProps = {
  name?: string;
  placeholder?: string;
  className?: string;
  input?: any;
  meta?: any;
  onButtonClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

// TODO use isLoading & disabled
function SearchInput({
  name = 'search',
  className,
  input,
  meta: _meta,
  onButtonClick,
  placeholder,
  // isLoading,
  // disabled,
}: NavbarSearchInputProps) {
  const intl = useIntl();

  return (
    <InputGroup
      flex="1"
      w="initial"
      h="full"
      className={className}
      endElement={
        <Button
          type="submit"
          onClick={onButtonClick}
          aria-label={intl.formatMessage(messages.search)}
          variant="ghost"
          borderRadius="0"
          h="full"
          w="50px"
          px="0"
          _hover={{
            bg: 'none',
            color: 'primary.500',
          }}
          _active={{
            bg: 'oaGray.100',
            color: 'primary.600',
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </Button>
      }
      endElementProps={{
        p: 0,
      }}
    >
      <Input
        h="inherit"
        placeholder={placeholder || intl.formatMessage(messages.search)}
        bg="white"
        borderColor="oaGray.300"
        borderRadius="0"
        pe="50px"
        _focus={{
          border: '1px solid',
          borderColor: 'primary.500',
          boxShadow: 'none',
        }}
        _active={{
          border: '1px solid',
          borderColor: 'primary.500',
          boxShadow: 'none',
        }}
        name={name}
        {...input}
      />
      {/* <InputRightElement h="full" w="50px"> */}
      {/*    */}
      {/* </InputRightElement> */}
    </InputGroup>
  );
}

const SearchFilter = React.forwardRef<any, any>(function SearchFilter(
  { disabled, isLoading, ...rest },
  ref,
) {
  const [filter] = useState(() => ({ name: 'search' }));

  return (
    <TypedSearchFilter
      ref={ref}
      name="search"
      filter={filter}
      isLoading={isLoading}
      disabled={disabled}
      inputComponent={SearchInput}
      {...rest}
    />
  );
});

export default SearchFilter;
