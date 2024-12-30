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
  return (
    <SortableSelect
      schema={schema}
      value={value}
      onChange={onChange}
      exclude={exclude}
      placeholder={placeholder}
      disabled={disabled}
      menuPosition={menuPosition}
      getFilterOptions={getFilterOptions}
      locationOptions={locationOptions}
      isFilterMode
    />
  );
}
