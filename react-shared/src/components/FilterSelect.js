import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import SortableSelect from './SortableSelect.js';

export default function FilterSelect({
  schema,
  value,
  onChange,
  exclude,
  placeholder,
  disabled = false,
  menuPosition = 'absolute',
  getFilterOptions,
  locationOptions = undefined,
}) {
  const intl = useIntl();

  const filterOptions = useMemo(() => {
    if (locationOptions) {
      return locationOptions.map((option) => ({
        value: option.value,
        label: intl.formatMessage(option.label),
      }));
    }
    return getFilterOptions(intl, schema, exclude);
  }, [intl, schema, exclude, locationOptions]);

  const selectedOptions = useMemo(
    () =>
      value
        .map((name) => filterOptions.find((o) => o.value === name))
        .filter((v) => !!v),
    [value, filterOptions],
  );

  return (
    <SortableSelect
      options={filterOptions}
      value={selectedOptions.map((option) => option.value)}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      menuPosition={menuPosition}
    />
  );
}
