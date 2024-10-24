import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  min: {
    id: 'ReactFilters.fields.SimpleRangeField.gte',
    defaultMessage: 'Min',
  },
  max: {
    id: 'ReactFilters.fields.SimpleRangeField.lte',
    defaultMessage: 'Max',
  },
});

// TODO minDate && maxDate from props

function SimpleDateRangeField({ input }, _ref) {
  const intl = useIntl();

  const { value, onChange } = input;

  const onInputChange = useCallback(
    (k, v) => {
      if (k === 'gte') {
        onChange({
          ...value,
          gte: v,
        });
      } else {
        onChange({
          ...value,
          lte: v,
        });
      }
    },
    [onChange, value],
  );

  return (
    <div>
      <input
        value={value?.gte || ''}
        type="date"
        className="form-control"
        aria-label={intl.formatMessage(messages.min)}
        onChange={(e) => onInputChange('gte', e.target.value)}
        max={value?.lte || ''}
      />
      <input
        value={value?.lte || ''}
        type="date"
        className="form-control"
        aria-label={intl.formatMessage(messages.max)}
        onChange={(e) => onInputChange('lte', e.target.value)}
        min={value?.gte || ''}
      />
    </div>
  );
}

export default React.forwardRef(SimpleDateRangeField);
