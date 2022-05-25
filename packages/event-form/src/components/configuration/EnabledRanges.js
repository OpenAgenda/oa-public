import React, { useState, useEffect } from 'react';
import MaskedInput from 'react-text-mask';
import { format } from 'date-fns';

import enabledRangesLabels from '@openagenda/labels/event/enabledRanges';
import flattenLabels from '@openagenda/labels/flatten';

import DateField from '@openagenda/form-schemas/client/build/Components/DateField';

const timeMask = [/\d/, /\d/, ':', /\d/, /\d/];

const EnabledRanges = ({
  lang = 'fr',
  value = null,
  field,
  onChange
}) => {
  const readValue = aValue => (aValue ? aValue[0] : null);
  const { constraints } = field;
  const labels = flattenLabels(enabledRangesLabels, lang);

  const [localValue, setLocalValue] = useState(value);
  const [checked, setChecked] = useState(!!readValue(value));
  const [constraintError, setConstraintError] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [timeError, setTimeError] = useState(null);

  const checkAndOnChange = newValue => {
    setLocalValue(newValue);
    const beginDate = readValue(newValue) && readValue(newValue).begin ? new Date(readValue(newValue).begin) : null;
    const endDate = readValue(newValue) && readValue(newValue).end ? new Date(readValue(newValue).end) : null;
    if (!beginDate || !endDate) {
      return;
    }
    setDateError(null);
    setConstraintError(null);
    setTimeError(null);
    if (beginDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date') {
      if (beginDate.toString() === 'Invalid Date') setTimeError({ begin: true });
      if (endDate.toString() === 'Invalid Date') setTimeError({ end: true });
      if (beginDate.toString() === 'Invalid Date' && endDate.toString() === 'Invalid Date') setTimeError({ begin: true, end: true });
      return;
    }
    if (!(beginDate < endDate)) {
      setDateError(true);
      return;
    }
    if (constraints && !(new Date(constraints[0].begin) <= beginDate && new Date(constraints[0].end) >= endDate)) {
      setConstraintError(true);
      return;
    }
    onChange(newValue);
  };

  useEffect(() => {
    checkAndOnChange(localValue);
  }, []);

  const getDate = name => {
    if (!readValue(localValue)) return null;
    if (!readValue(localValue)[name]) return null;
    if (readValue(localValue)[name].split('T')[0] === 'null') return null;
    return readValue(localValue)[name].split('T')[0];
  };

  const getTime = name => {
    if (!readValue(localValue)) return null;
    if (!readValue(localValue)[name]) return null;
    if (readValue(localValue)[name].split('T')[1] === 'null') return null;
    return readValue(localValue)[name].split('T')[1];
  };

  return (
    <div>
      <label htmlFor="checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            if (checked) {
              onChange(undefined);
            }
            setChecked(!checked);
          }}
        />
        {labels.checkboxInfo}
      </label>
      {checked ? (
        <>
          {constraints ? (
            <div className={`info-block-sm margin-bottom-sm ${constraintError ? 'danger' : ''}`}>
              <p>{labels.constraintInfo}</p>
              <p>{labels.from}: {new Date(constraints[0].begin).toLocaleDateString('fr-FR')} {labels.at} {new Date(constraints[0].begin).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
              <text>{labels.to}: {new Date(constraints[0].end).toLocaleDateString('fr-FR')} {labels.at} {new Date(constraints[0].end).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) }</text>
            </div>
          ) : null}
          <form className="form-inline">
            <div className="form-group">
              {labels.from}
            </div>
            <div className="form-group margin-h-sm">
              <DateField
                field={{
                  field: 'begin',
                  fieldType: 'date',
                }}
                value={getDate('begin')}
                enabled
                lang={lang}
                onChange={v => {
                  if (!getTime('begin')) {
                    checkAndOnChange([{ ...readValue(localValue), begin: `${format(v, 'yyyy-MM-dd')}` }]);
                    return;
                  }
                  checkAndOnChange([{ ...readValue(localValue), begin: `${format(v, 'yyyy-MM-dd')}T${getTime('begin')}` }]);
                }}
              />
            </div>
            <div className="form-group">
              {labels.at}
            </div>
            <div className={`form-group margin-left-sm ${timeError?.begin ? 'has-error' : ''}`}>
              <MaskedInput
                value={getTime('begin') || ''}
                className="form-control text-center"
                mask={timeMask}
                placeholder="HH:MM"
                keepCharPositions
                onBlur={e => {
                  checkAndOnChange([{ ...readValue(localValue), begin: `${getDate('begin')}T${e.target.value}` }]);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    checkAndOnChange([{ ...readValue(localValue), begin: `${getDate('begin')}T${e.target.value}` }]);
                  }
                }}
                style={{
                  width: '75px',
                }}
              />
            </div>
          </form>
          <form className="form-inline margin-top-sm">
            <div className="form-group">
              {labels.to}
            </div>
            <div className={`form-group  margin-h-sm ${dateError ? 'has-error' : ''}`}>
              <DateField
                field={{
                  field: 'end',
                }}
                value={getDate('end')}
                enabled
                lang={lang}
                onChange={v => {
                  if (!getTime('end')) {
                    checkAndOnChange([{ ...readValue(localValue), end: `${format(v, 'yyyy-MM-dd')}` }]);
                    return;
                  }
                  checkAndOnChange([{ ...readValue(localValue), end: `${format(v, 'yyyy-MM-dd')}T${getTime('end')}` }]);
                }}
              />
            </div>
            <div className="form-group">
              {labels.at}
            </div>
            <div className={`form-group margin-left-sm ${timeError?.end ? 'has-error' : ''}`}>
              <MaskedInput
                className="form-control text-center"
                value={getTime('end') || ''}
                mask={timeMask}
                placeholder="HH:MM"
                keepCharPositions
                onBlur={e => {
                  checkAndOnChange([{ ...readValue(localValue), end: `${getDate('end')}T${e.target.value}` }]);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    checkAndOnChange([{ ...readValue(localValue), end: `${getDate('end')}T${e.target.value}` }]);
                  }
                }}
                style={{
                  width: '75px',
                }}
              />
            </div>
          </form>
          {constraintError || dateError || timeError ? (
            <div className="info-block-sm danger">
              {timeError ? labels.timeError : null}
              {dateError ? labels.dateError : null}
              {constraintError ? labels.constraintError : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
export default EnabledRanges;
