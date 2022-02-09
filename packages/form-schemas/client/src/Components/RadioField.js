import React, { useState } from 'react';

import formSchemaLabels from '@openagenda/labels/form-schemas';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(formSchemaLabels);

export default function RadioField(props) {
  const {
    onChange,
    field,
    value,
    lang,
    optional
  } = props;

  const [hasClicked, setHasClicked] = useState(false);

  const onSelect = option => {
    setHasClicked(true);

    onChange(option.id);
  };

  const isChecked = option => {
    if (!hasClicked && !value && field.default) {
      return option.id === field.default;
    }

    return option.id === value;
  };

  return (
    <>
      {field.options.filter(o => o.display).concat(optional ? [{
        label: getLabel('noChoice', lang),
        id: null
      }] : []).map(o => (
        <div
          className="radio"
          key={[field.name, o.value].join('.')}
        >
          <label htmlFor={`${field.name}.${o.value}`}>
            <input
              id={`${field.name}.${o.value}`}
              type="radio"
              name={field.name}
              onChange={onSelect.bind(null, o)}
              checked={isChecked(o)}
            />
            {o.label}
            {o.info && <div className="text-muted">{o.info}</div>}
          </label>
        </div>
      ))}
    </>
  );
}
