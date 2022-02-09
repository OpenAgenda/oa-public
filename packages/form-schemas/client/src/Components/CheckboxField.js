import React, { Fragment } from 'react';

export default function CheckboxField(props) {
  const {
    field: {
      options,
      field: name,
      default: defaultValue
    },
    value,
    onChange
  } = props;

  const defaultChecked = [].concat(defaultValue || []);

  const checked = [].concat(value || defaultChecked);

  return (
    <>
      {options.filter(o => o.display).map(o => (
        <div
          className="checkbox"
          key={[name, o.value].join('.')}
        >
          <label htmlFor={`${name}.${o.value}`}>
            <input
              id={`${name}.${o.value}`}
              type="checkbox"
              onChange={onChange.bind(null, checked.includes(o.id) ? checked.filter(cId => cId !== o.id) : checked.concat(o.id))}
              checked={checked.includes(o.id)}
            />
            {o.label}
          </label>
        </div>
      ))}
    </>
  );
}
