import { Input, Button, InputGroup } from '@openagenda/uikit';
// import { InputGroup } from '@openagenda/uikit/snippets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  ariaLabel: {
    id: 'next.components.NavbarSearchInput.ariaLabel',
    defaultMessage: 'Search',
  },
});

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
export default function NavbarSearchInput({
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
      bg="oaGray.10"
      display="flex"
      flex="1"
      w="initial"
      h="full"
      className={className}
      endElement={
        <Button
          type="submit"
          onClick={onButtonClick}
          aria-label={intl.formatMessage(messages.ariaLabel)}
          variant="ghost"
          borderRadius="0"
          h="full"
          w="50px"
          px="0"
          color="fg.subtle"
          _hover={{
            bg: 'none',
            color: 'colorPalette.solid',
          }}
          _active={{
            bg: 'bg.muted',
            color: 'colorPalette.fg',
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
        placeholder={placeholder || intl.formatMessage(messages.ariaLabel)}
        borderRadius="0"
        boxShadow="none"
        pe="50px"
        _focus={{
          border: '1px solid',
          borderColor: 'primary.500',
          boxShadow: 'none',
          outlineWidth: '0',
        }}
        _active={{
          border: '1px solid',
          borderColor: 'primary.500',
          boxShadow: 'none',
        }}
        name={name}
        {...input}
      />
    </InputGroup>
  );
}
