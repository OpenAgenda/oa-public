import { useEffect } from 'react';
import classNames from 'classnames';
import Help from './Help';

const hasHelp = require('../lib/hasHelp');
const isFieldOptional = require('../lib/isFieldOptional');

function defineChecked(field, value) {
  const { default: defaultValue } = field;

  const hasDefinedValue = ![null, undefined].includes(value);
  const hasDefaultValue = defaultValue !== undefined;

  if (hasDefinedValue) {
    return value;
  }

  if (hasDefaultValue) {
    return defaultValue;
  }

  return false;
}

export default (props) => {
  const {
    lang,
    labels,
    relatedValues,
    field: { field: name, label, info },
    onChange,
    value,
    error,
    enabled,
  } = props;

  const { field } = props;

  const isOptional = isFieldOptional(field, relatedValues.optional);
  const checked = defineChecked(field, value);

  useEffect(function forceUncheckedBoxes() {
    if (!enabled) {
      return;
    }
    if (!checked && !value && value !== false) {
      onChange(false);
    }
  }, []);

  return (
    <div className="checkbox">
      <label htmlFor={name}>
        <input
          id={name}
          type="checkbox"
          name={name}
          onChange={() => onChange(!checked)}
          checked={checked}
          disabled={!enabled}
        />
        <span
          className={classNames({
            'margin-right-xs': hasHelp(field) || !isOptional,
          })}
        >
          {label}
        </span>
        {isOptional ? null : (
          <span
            className={classNames({
              'margin-right-xs': hasHelp(field),
              error: !!error,
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
