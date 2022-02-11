import React from 'react';

export default function TextField(props) {
  const {
    field,
    value,
    enabled,
    onChange
  } = props;

  const {
    field: name,
    placeholder,
    fieldType,
    default: defaultValue
  } = field;

  return (
    <textarea
      name={name}
      rows={fieldType === 'textarea' ? 3 : 1}
      value={value ?? (defaultValue ?? '')}
      placeholder={placeholder}
      onChange={e => {
        e.preventDefault();
        onChange(e.target.value);
      }}
      disabled={!enabled}
    />
  );
}
