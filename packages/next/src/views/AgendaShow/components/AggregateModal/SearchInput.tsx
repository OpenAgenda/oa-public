import { useState, useMemo, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { InputGroup, Input, InputRightElement, Button } from '@openagenda/uikit';
import { faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface SearchInputProps {
  name?: string;
  onChange: (value: string) => void;
  initialValue?: string;
  onButtonClick?: () => void;
}

export default function SearchInput({
  name = 'search',
  onChange: onChangeCallback,
  initialValue = '',
  onButtonClick = null,
}: SearchInputProps) {
  const [searchText, setSearchText] = useState(initialValue);

  const debouncedOnChange = useMemo(
    () => debounce((value: string) => onChangeCallback(value), 500),
    [onChangeCallback],
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    debouncedOnChange(e.target.value);
  }, [debouncedOnChange]);

  useEffect(() => {
    if (initialValue) {
      setSearchText(initialValue);
    }
  }, [initialValue]);

  return (
    <InputGroup>
      <Input
        name={name}
        value={searchText}
        onChange={onChange}
      />
      <InputRightElement>
        <Button variant="ghost" type="submit" onClick={onButtonClick}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}
