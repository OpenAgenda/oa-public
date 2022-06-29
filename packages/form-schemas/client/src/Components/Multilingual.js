import _ from 'lodash';
import ih from 'immutability-helper';
import React, { useCallback } from 'react';

import FieldCounter from './FieldCounter';
import Sub from './Sub';
import TextField from './TextField';

function extractLanguageValue(value, l) {
  if (!value) return;

  if (typeof value === 'string') {
    return value;
  }

  return value?.[l];
}

function multilingualizeValue(value, languages) {
  if (!value) return {};

  if (typeof value === 'string') {
    return languages.reduce((multilingualValue, language) => ({
      ...multilingualValue,
      [language]: value
    }), {});
  }

  return value;
}

const MultilingualField = ({
  onChange,
  value,
  field,
  error,
  enabled,
  lang,
  FieldComponent
}) => {
  const myOnChange = useCallback((language, singleLanguageValue) => {
    const multilingualizedValue = multilingualizeValue(value, field.languages);
    onChange({
      ...multilingualizedValue,
      [language]: singleLanguageValue
    });
  }, [onChange, field.languages, value]);

  const renderField = useCallback(l => {
    const languageField = ih(field, {
      default: {
        $set: _.get(
          field,
          ['default', l],
          _.isObject(field.default) ? null : field.default
        )
      }
    });

    return (
      <div>
        <FieldComponent
          lang={lang}
          field={languageField}
          enabled={enabled}
          value={extractLanguageValue(value, l)}
          onChange={v => myOnChange(l, v)}
        />
        {field.max ? <FieldCounter value={_.get(value, l)} max={field.max} /> : null}
        <Sub label={field.sub} error={_.get(error, l)} />
      </div>
    );
  }, [enabled, error, field, value, myOnChange, lang]);

  if (field.languages.length === 1) {
    return renderField(field.languages[0]);
  }

  return (
    <ul className="list-unstyled">
      {field.languages.map(l => (
        <li key={`${field.field}_${l}`}>
          <div className="lang-input">
            <label htmlFor={`${field.field}.${l}`}>{l}</label>
            {renderField(l)}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MultilingualField;

/*export default fieldComponent => props => (
   <MultilingualField
    {...props}
    FieldComponent={fieldComponent}
  />
); */
