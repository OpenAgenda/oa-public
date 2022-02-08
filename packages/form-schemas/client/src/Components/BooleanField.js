import React from 'react';
import classNames from 'classnames';
import Help from './Help';

const hasHelp = require('../lib/hasHelp');
const isFieldOptional = require('../lib/isFieldOptional');

export default props => {
  const {
    lang,
    labels,
    relatedValues,
    field: {
      field: name,
      label,
      info
    },
    onChange,
    value,
    error
  } = props;

  const {
    field
  } = props;

  const isOptional = isFieldOptional(field, relatedValues.optional);
  const falsyValue = isOptional ? false : undefined;

  return (
    <div className="checkbox">
      <label htmlFor={name}>
        <input
          id={name}
          type="checkbox"
          name={name}
          onChange={() => onChange(value ? falsyValue : true)}
          checked={!!value}
        />
        <span className={classNames({ 'margin-right-xs': hasHelp(field) || !isOptional })}>{label}</span>
        {isOptional ? null : (
          <span
            className={classNames({
              'margin-right-xs': hasHelp(field),
              error: !!error
            })}
          >
            {`(${labels.required})`}
          </span>
        )}
        {hasHelp(field) ? (
          <Help
            id={`help-${field.field}`}
            label={field.help}
            lang={lang}
            link={field.helpLink}
            content={field.helpContent}
          />
        ) : null}
        {info ? <div className="text-muted">{info}</div> : null}
      </label>
    </div>
  );
};
