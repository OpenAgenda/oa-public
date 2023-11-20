export default function Checkbox({
  id,
  label,
  type = 'checkbox',
  onChange,
  value = false,
  info = null,
}) {
  return (
    <div className="margin-right-sm margin-bottom-sm">
      <label htmlFor={id} className="margin-h-xs">
        <input
          id={id}
          checked={value}
          type={type}
          onChange={onChange}
          className="margin-right-sm"
        />
        {label}
      </label>
      {info ? (<div className="text-muted margin-h-xs"> {info} </div>) : null}
    </div>
  );
}
