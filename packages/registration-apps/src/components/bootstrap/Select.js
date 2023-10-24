import ReactSelect from 'react-select';

export default function Select({
  options,
  onChange,
  placeholder,
  label,
  id,
  value,
  inline = false,
  disabled = false,
}) {
  const selectedOption = value !== undefined && typeof value !== 'object' ? options.find(o => o.value === value) : value;

  return (
    <div className="form-group margin-right-sm">
      <label htmlFor={id} className="margin-right-sm">{label}</label>
      <div className={inline ? 'input-group' : ''}>
        <ReactSelect
          isDisabled={disabled}
          value={selectedOption}
          id={id}
          options={options}
          onChange={onChange}
          placeholder={placeholder}
          menuPosition="fixed"
        />
      </div>
    </div>
  );
}
