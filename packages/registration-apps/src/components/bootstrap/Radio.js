export default function Radio({
  name,
  options = [],
  value,
  onChange,
  info = null,
  warning = false,
  children = null,
}) {
  return (
    <div
      className={`radio-group margin-right-sm margin-bottom-sm ${warning ? 'has-warning' : ''}`}
    >
      {options.map((option, index) => (
        <div key={option.value || index} className="radio">
          <label htmlFor={`${name}-${option.value || index}`}>
            <input
              id={`${name}-${option.value || index}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              type="radio"
              onChange={() => onChange(option.value)}
              className="margin-right-sm"
            />
            {option.label}
            {option.info ? (
              <div className="text-muted"> {option.info} </div>
            ) : null}
          </label>
          {value === option.value && option.children && (
            <div className="radio-child">{option.children}</div>
          )}
        </div>
      ))}
      {info ? <div className="text-muted margin-top-sm"> {info} </div> : null}
      {value && children && <div className="radio-child">{children}</div>}
    </div>
  );
}
