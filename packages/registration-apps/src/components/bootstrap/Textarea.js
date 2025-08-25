import { useEffect, useRef } from 'react';
import autosize from 'autosize';
import FieldCounter from './FieldCounter.js';

export default function Textarea({
  id,
  label,
  info,
  onChange,
  value,
  placeholder,
  max,
  required,
  actionButton,
}) {
  const ref = useRef();

  useEffect(() => {
    autosize(ref.current);
  }, [ref]);

  return (
    <div className="form-group margin-right-sm">
      {label ? (
        <label htmlFor={id} className="margin-right-xs">
          {label}
          {required && (
            <span style={{ fontWeight: 'normal' }}> (Champ obligatoire)</span>
          )}
        </label>
      ) : null}
      {info ? (
        <div className="text-muted text-sm margin-bottom-xs">{info}</div>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={onChange}
        className="form-control"
        placeholder={placeholder}
        maxLength={max}
        rows={3}
      />
      {max ? <FieldCounter value={value} max={max} /> : null}
      {actionButton ? (
        <div className="margin-top-xs">{actionButton}</div>
      ) : null}
    </div>
  );
}
