import { InputGroup, Input, InputRightElement, Button } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  ariaLabel: {
    id: 'next.components.SearchInput.ariaLabel',
    defaultMessage: 'Search',
  },
});

type SearchInputProps = {
  name?: string;
  className?: string;
  input?: any;
  onButtonClick?: () => void;
};

// TODO use isLoading & disabled
export default function SearchInput({
  name = 'search',
  className,
  input,
  onButtonClick,
}: SearchInputProps) {
  const intl = useIntl();

  return (
    <InputGroup bg="oaGray.10" maxW="210px" flex="1" h="full" className={className}>
      <Input
        h="inherit"
        placeholder="Rechercher"
        borderRadius="0"
        borderY="none"
        boxShadow="none"
        pr="50px"
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
      <InputRightElement
        h="full"
        w="50px"
      >
        <Button
          type="submit"
          onClick={onButtonClick}
          aria-label={intl.formatMessage(messages.ariaLabel)}
          variant="ghost"
          borderRadius="0"
          h="full"
          w="full"
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
      </InputRightElement>
    </InputGroup>
  );
}
