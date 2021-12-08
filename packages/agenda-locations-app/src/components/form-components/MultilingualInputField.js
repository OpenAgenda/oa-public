import React from 'react';

import utils from '@openagenda/utils';

const MultilingualInputField = ({
  enabled,
  languages,
  name,
  value,
  type,
  getLabel,
  label,
  info,
  placeholder,
  onChange,
  rows,
}) => {
  const classes = ['multilingual-input-field', 'form-group'];
  if (enabled && !enabled.length) classes.push('disable');

  const myOnChange = lang => (e => {
    const newValue = JSON.parse(JSON.stringify(value));
    newValue[lang] = e.target.value;
    onChange(name, newValue);
  });

  const isEnabled = lang => {
    if (!utils.isArray(enabled)) return true;
    return enabled.indexOf(lang) !== -1;
  };

  const renderField = lang => {
    const completedName = languages.length > 1 ? `${name}_${lang}` : name;
    return (
      <div>
        {type === 'textarea' ? (
          <textarea
            name={completedName}
            rows={rows}
            placeholder={getLabel(placeholder) || placeholder}
            value={value[lang]}
            className="form-control"
            onChange={myOnChange(lang)}
            disabled={!isEnabled(lang)}
          />
        ) : (
          <input
            name={completedName}
            type="text"
            placeholder={getLabel(placeholder) || placeholder}
            value={value[lang]}
            className="form-control"
            onChange={myOnChange(lang)}
            disabled={!isEnabled(lang)}
          />
        )}
      </div>
    );
  };

  const renderLanguageBlock = lang => {
    if (languages.length > 1) {
      return (
        <div className="lang-unit">
          <label htmlFor={lang}>{lang}</label>
          <div>
            {renderField(lang)}
          </div>
        </div>
      );
    } return renderField(lang);
  };

  return (
    <div className={classes.join(' ')}>
      <label htmlFor={label}>{label || getLabel(name)}</label>
      {info ? <span className="info">{getLabel(info) || info}</span> : null}
      <ul className="list-unstyled">
        {languages.map(lang => (
          <li key={lang} className={isEnabled(lang) ? '' : 'disabled'}>
            {renderLanguageBlock(lang)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MultilingualInputField;
