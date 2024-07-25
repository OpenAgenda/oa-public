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
  error = false,
  optional = true,
}) {
  const selectedOption = value !== undefined && typeof value !== 'object' ? options.find(o => o.value === value) : value;

  return (
    <div className={`form-group margin-right-sm ${error && error.length > 0 ? 'has-error' : ''}`}>
      <label htmlFor={id} className="control-label margin-right-xs">
        {label}
      </label>
      {!optional ? (
        <span className={`${error && error.length > 0 ? 'text-danger' : ''}`}>(Champ obligatoire) </span>
      ) : null}
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
      {error
        && error.length > 0
        && error.map(e => (
          <div key={e.code} className="text-danger">
            {e.label}
          </div>
        ))}
    </div>
  );
}
