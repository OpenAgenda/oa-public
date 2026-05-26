import { useCallback, useMemo } from 'react';
import { getLocaleValue } from '@openagenda/intl';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';

import labels from './lib/labels.js';

const getLabel = makeLabelGetter(labels);

const MULTI_TYPES = ['checkbox', 'multiselect'];

// Options only receive a stable numeric `id` when the schema is validated
// (server side / on save). Brand-new options added in the current builder
// session have no id yet, so we key the default on `id` when available and
// fall back to the option `value`. `fieldAssignOptionIds` reconciles any
// value-based default back to the freshly assigned id at validation time.
const optionToken = (option) => option.id ?? option.value;

const DefaultValue = ({ field, value, lang, onChange }) => {
  const disabled = field.enable === false;
  const multi = MULTI_TYPES.includes(field.optionedType);

  const options = useMemo(
    () => (field.options || []).filter((o) => o && o.display !== false),
    [field.options],
  );

  const selectedTokens = useMemo(() => {
    if (value === null || value === undefined) return [];
    return [].concat(value);
  }, [value]);

  const isSelected = useCallback(
    (option) => selectedTokens.some((t) => t === optionToken(option)),
    [selectedTokens],
  );

  const handleSingleChange = useCallback(
    (raw) => {
      if (raw === '') {
        onChange(null);
        return;
      }
      const option = options.find((o) => String(optionToken(o)) === raw);
      onChange(option ? optionToken(option) : null);
    },
    [options, onChange],
  );

  const toggleMulti = useCallback(
    (option) => {
      const token = optionToken(option);
      const next = selectedTokens.some((t) => t === token)
        ? selectedTokens.filter((t) => t !== token)
        : selectedTokens.concat([token]);
      onChange(next.length ? next : null);
    },
    [selectedTokens, onChange],
  );

  if (!options.length) {
    return (
      <div className="default-value-field text-muted">
        {getLabel('defaultValueNoOptions', lang)}
      </div>
    );
  }

  if (multi) {
    return (
      <div className="default-value-field">
        {options.map((option) => (
          <div className="checkbox" key={String(optionToken(option))}>
            <label>
              <input
                type="checkbox"
                checked={isSelected(option)}
                onChange={() => toggleMulti(option)}
                disabled={disabled}
              />{' '}
              {getLocaleValue(option.label, lang) || option.value}
            </label>
          </div>
        ))}
      </div>
    );
  }

  const singleValue = selectedTokens.length ? String(selectedTokens[0]) : '';

  return (
    <div className="default-value-field">
      <select
        className="form-control"
        value={singleValue}
        onChange={(e) => handleSingleChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{getLabel('defaultValueNone', lang)}</option>
        {options.map((option) => (
          <option
            key={String(optionToken(option))}
            value={String(optionToken(option))}
          >
            {getLocaleValue(option.label, lang) || option.value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DefaultValue;
