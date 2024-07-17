import React, { useCallback, useState, useEffect } from 'react';

import { defineMessages, useIntl } from 'react-intl';
import { useDebounce } from 'use-debounce';

const messages = defineMessages({
  min: {
    id: 'ReactFilters.fields.NumberRangeField.gte',
    defaultMessage: 'Min',
  },
  max: {
    id: 'ReactFilters.fields.NumberRangeField.lte',
    defaultMessage: 'Max',
  },
});

function NumberRangeField({ input }, _ref) {
  const m = useIntl().formatMessage;

  const { value, onChange } = input;

  const [gteString, setGTEString] = useState(value?.gte);
  const [lteString, setLTEString] = useState(value?.lte);

  const [debouncedGTE] = useDebounce(gteString, 500);
  const [debouncedLTE] = useDebounce(lteString, 500);

  const onInputChange = useCallback((k, v) => {
    if (k === 'gte') {
      setGTEString(v);
    } else {
      setLTEString(v);
    }
  }, []);

  useEffect(() => {
    setGTEString(value?.gte ?? '');
    setLTEString(value?.lte ?? '');
  }, [value]);

  useEffect(() => {
    onChange({
      lte: debouncedLTE,
      gte: debouncedGTE,
    });
  }, [debouncedGTE, debouncedLTE, onChange]);

  return (
    <div className="row">
      <div className="col-xs-6">
        <label className="sr-only" htmlFor={`number-range-${input.name}-gte`}>
          {m(messages.min)}
        </label>
        <input
          value={gteString}
          type="number"
          className="form-control"
          id={`number-range-${input.name}-gte`}
          placeholder={m(messages.min)}
          onChange={e => onInputChange('gte', e.target.value)}
        />
      </div>
      <div className="form-group col-xs-6">
        <label className="sr-only" htmlFor={`number-range-${input.name}-lte`}>
          {m(messages.max)}
        </label>
        <input
          value={lteString}
          type="number"
          className="form-control"
          id={`number-range-${input.name}-lte`}
          placeholder={m(messages.max)}
          onChange={e => onInputChange('lte', e.target.value)}
        />
      </div>
    </div>
  );
}

export default React.forwardRef(NumberRangeField);
