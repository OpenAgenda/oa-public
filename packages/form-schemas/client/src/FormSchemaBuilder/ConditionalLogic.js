import { useCallback, useMemo } from 'react';
import { getLocaleValue } from '@openagenda/intl';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';

import labels from './lib/labels.js';

const getLabel = makeLabelGetter(labels);

const FIELD_TYPES_WITH_OPTIONS = ['radio', 'select', 'checkbox', 'multiselect'];

const emptyValue = () => ({
  mode: 'none',
  field: null,
  valueMode: 'any',
  value: [],
});

const getLinkedOptions = (linkedField, lang) => {
  if (!linkedField) return null;
  if (FIELD_TYPES_WITH_OPTIONS.includes(linkedField.fieldType)) {
    return (linkedField.options || []).map((o) => ({
      id: o.id ?? o.value,
      label: getLocaleValue(o.label, lang) ?? String(o.id ?? o.value),
    }));
  }
  if (linkedField.fieldType === 'boolean') {
    return [
      { id: true, label: getLabel('fieldConditionalBooleanTrue', lang) },
      { id: false, label: getLabel('fieldConditionalBooleanFalse', lang) },
    ];
  }
  return null;
};

const ConditionalLogic = ({ field, value, lang, onChange }) => {
  const current = value && typeof value === 'object' ? value : emptyValue();
  const disabled = field.enable === false;
  const { currentFieldSlug } = field;

  const availableSiblings = useMemo(
    () =>
      (field.siblings || []).filter(
        (f) =>
          f
          && f.field
          && f.field !== currentFieldSlug
          && f.fieldType !== 'section'
          && f.fieldType !== 'abstract',
      ),
    [field.siblings, currentFieldSlug],
  );

  const linkedField = useMemo(() => {
    if (!current.field) return null;
    return availableSiblings.find((f) => f.field === current.field) || null;
  }, [availableSiblings, current.field]);

  const linkedOptions = useMemo(
    () => getLinkedOptions(linkedField, lang),
    [linkedField, lang],
  );

  const linkIsStale = !!current.field && !linkedField;

  const update = useCallback(
    (patch) => {
      onChange({ ...current, ...patch });
    },
    [current, onChange],
  );

  const handleModeChange = useCallback(
    (mode) => {
      if (mode === 'none') {
        onChange(emptyValue());
      } else {
        update({ mode });
      }
    },
    [onChange, update],
  );

  const handleFieldChange = useCallback(
    (fieldSlug) => {
      const nextField = availableSiblings.find((f) => f.field === fieldSlug);
      const nextOptions = getLinkedOptions(nextField, lang);
      const keepValueMode = current.valueMode === 'specific' && !!nextOptions;
      update({
        field: fieldSlug || null,
        valueMode: keepValueMode ? 'specific' : 'any',
        value: [],
      });
    },
    [availableSiblings, current.valueMode, lang, update],
  );

  const handleValueModeChange = useCallback(
    (valueMode) => {
      update({
        valueMode,
        value: valueMode === 'specific' ? current.value : [],
      });
    },
    [current.value, update],
  );

  const toggleValue = useCallback(
    (optionId) => {
      const has = current.value.some((v) => v === optionId);
      const nextValues = has
        ? current.value.filter((v) => v !== optionId)
        : current.value.concat([optionId]);
      update({ value: nextValues });
    },
    [current.value, update],
  );

  const handleClearLink = useCallback(() => {
    onChange(emptyValue());
  }, [onChange]);

  const noOptionsAvailable = availableSiblings.length === 0;

  return (
    <div className="conditional-logic-field">
      <div className="form-group">
        <div className="radio">
          <label>
            <input
              type="radio"
              name="conditional-mode"
              value="none"
              checked={current.mode === 'none'}
              onChange={() => handleModeChange('none')}
              disabled={disabled}
            />{' '}
            {getLabel('fieldConditionalModeNone', lang)}
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              name="conditional-mode"
              value="enable"
              checked={current.mode === 'enable'}
              onChange={() => handleModeChange('enable')}
              disabled={disabled || noOptionsAvailable}
            />{' '}
            {getLabel('fieldConditionalModeEnable', lang)}
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              name="conditional-mode"
              value="optional"
              checked={current.mode === 'optional'}
              onChange={() => handleModeChange('optional')}
              disabled={disabled || noOptionsAvailable}
            />{' '}
            {getLabel('fieldConditionalModeOptional', lang)}
          </label>
        </div>
      </div>

      {current.mode !== 'none' ? (
        <>
          <div className="form-group">
            <label htmlFor="conditional-linked-field">
              {getLabel('fieldConditionalLinkedFieldLabel', lang)}
            </label>
            <select
              id="conditional-linked-field"
              className="form-control"
              value={current.field || ''}
              onChange={(e) => handleFieldChange(e.target.value)}
              disabled={disabled}
            >
              <option value="">
                {getLabel('fieldConditionalLinkedFieldPlaceholder', lang)}
              </option>
              {availableSiblings.map((f) => (
                <option key={f.field} value={f.field}>
                  {getLocaleValue(f.label, lang) || f.field}
                </option>
              ))}
            </select>
            {linkIsStale ? (
              <div className="margin-top-xs">
                <span className="text-warning">
                  {getLabel('fieldConditionalLinkedFieldMissing', lang)}
                </span>
                {!disabled ? (
                  <button
                    type="button"
                    className="btn btn-link btn-xs margin-left-sm"
                    onClick={handleClearLink}
                  >
                    {getLabel('fieldConditionalClearLink', lang)}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {linkedField ? (
            <div className="form-group">
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    name="conditional-value-mode"
                    value="any"
                    checked={current.valueMode === 'any'}
                    onChange={() => handleValueModeChange('any')}
                    disabled={disabled}
                  />{' '}
                  {getLabel('fieldConditionalTriggerAnyValue', lang)}
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    name="conditional-value-mode"
                    value="specific"
                    checked={current.valueMode === 'specific'}
                    onChange={() => handleValueModeChange('specific')}
                    disabled={disabled || !linkedOptions}
                  />{' '}
                  {getLabel('fieldConditionalTriggerSpecificValue', lang)}
                  {!linkedOptions ? (
                    <span className="text-muted margin-left-sm">
                      (
                      {getLabel(
                        'fieldConditionalTriggerSpecificValueDisabled',
                        lang,
                      )}
                      )
                    </span>
                  ) : null}
                </label>
              </div>
            </div>
          ) : null}

          {linkedField && current.valueMode === 'specific' && linkedOptions ? (
            <div className="form-group">
              <label>{getLabel('fieldConditionalValueLabel', lang)}</label>
              <div>
                {linkedOptions.map((opt) => {
                  const checked = current.value.some((v) => v === opt.id);
                  return (
                    <div className="checkbox" key={String(opt.id)}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleValue(opt.id)}
                          disabled={disabled}
                        />{' '}
                        {opt.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default ConditionalLogic;
