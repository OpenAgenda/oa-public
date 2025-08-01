import { useState, useMemo, useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import debounce from 'lodash/debounce';
import { InputGroup, Input, Button } from '@openagenda/uikit';
import { faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const messages = defineMessages({
  ariaLabel: {
    id: 'next.components.SearchInput.ariaLabel',
    defaultMessage: 'Search',
  },
});

interface SearchInputProps {
  name?: string;
  onChange: (value: string) => void;
  initialValue?: string;
  onButtonClick?: () => void;
  placeholder?: string;
  autoComplete?: string;
}

export default function SearchInput({
  name = 'search',
  onChange: onChangeCallback,
  initialValue = '',
  onButtonClick = null,
  placeholder,
  autoComplete,
}: SearchInputProps) {
  const intl = useIntl();
  const [searchText, setSearchText] = useState(initialValue);

  const debouncedOnChange = useMemo(
    () => debounce((value: string) => onChangeCallback(value), 500),
    [onChangeCallback],
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
      debouncedOnChange(e.target.value);
    },
    [debouncedOnChange],
  );

  useEffect(() => {
    if (initialValue) {
      setSearchText(initialValue);
    }
  }, [initialValue]);

  return (
    <InputGroup
      endElement={
        <Button
          colorPalette="gray"
          variant="ghost"
          type="submit"
          onClick={onButtonClick}
          aria-label={intl.formatMessage(messages.ariaLabel)}
          me="-3"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </Button>
      }
    >
      <Input
        name={name}
        value={searchText}
        onChange={onChange}
        placeholder={placeholder || intl.formatMessage(messages.ariaLabel)}
        autoComplete={autoComplete}
      />
    </InputGroup>
  );
}
