import { useState, useMemo, useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import debounce from 'lodash/debounce';
import { InputGroup, Input, Button, createIcon } from '@openagenda/uikit';

const MagnifyingGlassIcon = createIcon({
  displayName: 'MagnifyingGlassIcon',
  viewBox: '0 0 512 512',
  path: (
    <path
      fill="currentColor"
      d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
    />
  ),
});

const messages = defineMessages({
  ariaLabel: {
    id: 'react.components.SearchInput.ariaLabel',
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
      endElement={(
        <Button
          colorPalette="gray"
          variant="ghost"
          type="submit"
          onClick={onButtonClick}
          aria-label={intl.formatMessage(messages.ariaLabel)}
          me="-3"
        >
          <MagnifyingGlassIcon />
        </Button>
      )}
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
