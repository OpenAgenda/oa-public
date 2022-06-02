import React from 'react';
import { Calendar } from 'react-date-range';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import { format } from 'date-fns';
import * as rdrLocales from 'react-date-range/dist/locale';

import dateLabels from '@openagenda/labels/form-schemas/date';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(dateLabels);

if (module.hot) module.hot.accept();

const getContent = (value, placeholder, lang) => {
  if (!value) return placeholder || getLabel('pickADate', lang);

  return format(value, 'yyyy-MM-dd');
};

const getValueAsDate = v => {
  if (!v) return v;

  return typeof v === 'string' ? new Date(v) : v;
};

function DateField({
  field,
  value,
  enabled,
  onChange,
  lang,
  className
}) {
  const {
    field: fieldName,
    placeholder
  } = field;

  const cleanValue = getValueAsDate(value);

  return (
    <div
      className={className || ''}
    >{enabled ? (
      <Dropdown
        id={`${fieldName}-input`}
      >
        <Dropdown.Toggle
          bsRole="toggle"
          className="form-control"
        >
          {getContent(cleanValue, placeholder, lang)}
        </Dropdown.Toggle>
        <Dropdown.Menu bsRole="menu">
          <Calendar
            date={cleanValue || null}
            onChange={onChange}
            locale={rdrLocales[lang]}
          />
        </Dropdown.Menu>
      </Dropdown>
    ) : (
      <input
        disabled
        className="form-control inline"
        value={getContent(cleanValue, placeholder, lang)}
        style={{ width: 'auto' }}
      />
    )}
    </div>
  );
}

export default DateField;
