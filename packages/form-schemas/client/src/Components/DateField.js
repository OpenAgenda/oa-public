import React from 'react';
import { Calendar } from 'react-date-range';
import { Dropdown } from '@openagenda/react-shared';
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
    placeholder
  } = field;

  const cleanValue = getValueAsDate(value);

  return (
    <div
      className={className || ''}
    >{enabled ? (
      <Dropdown
        className="dropdown btn-group open"
        Trigger={props => (
          <button type="button" {...props} className="form-control btn btn-default">
            {getContent(cleanValue, placeholder, lang)}&nbsp;
            <span className="caret" />
          </button>
        )}
      >
        <div className="dropdown-calendar" style={{ minWidth: '300px' }}>
          <Calendar
            date={cleanValue || null}
            onChange={onChange}
            locale={rdrLocales[lang]}
          />
        </div>
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
