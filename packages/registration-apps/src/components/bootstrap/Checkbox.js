export default function Checkbox({
  id,
  label,
  type = 'checkbox',
  onChange,
  value = false,
  info = null,
  warning = false,
  children = null,
}) {
  return (
    <div
      className={`checkbox margin-right-sm margin-bottom-sm ${warning ? 'has-warning' : ''}`}
    >
      <label htmlFor={id}>
        <input
          id={id}
          checked={value}
          type={type}
          onChange={onChange}
          className="margin-right-sm"
        />
        <strong>{label}</strong>
        {info ? <div className="text-muted"> {info} </div> : null}
      </label>
      <div className="checkbox-child">{children}</div>
    </div>
  );
}
