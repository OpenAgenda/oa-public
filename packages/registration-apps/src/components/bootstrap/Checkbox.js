export default function Checkbox({
  id,
  label,
  type = 'checkbox',
  onChange,
  value = false,
  info = null,
}) {
  return (
    <div className="checkbox margin-right-sm margin-bottom-sm">
      <label htmlFor={id}>
        <input
          id={id}
          checked={value}
          type={type}
          onChange={onChange}
          className="margin-right-sm"
        />
        <strong>{label}</strong>
        {info ? (<div className="text-muted"> {info} </div>) : null}
      </label>
    </div>
  );
}
