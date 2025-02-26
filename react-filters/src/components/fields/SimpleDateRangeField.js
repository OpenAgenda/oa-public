import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  startDate: {
    id: 'ReactFilters.fields.SimpleRangeField.startDate',
    defaultMessage: 'Start date',
  },
  endDate: {
    id: 'ReactFilters.fields.SimpleRangeField.endDate',
    defaultMessage: 'End date',
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
      <label>
        {intl.formatMessage(messages.startDate)}
        <input
          value={value?.gte || ''}
          type="date"
          className="form-control"
          onChange={(e) => onInputChange('gte', e.target.value)}
          max={value?.lte}
        />
      </label>

      <label>
        {intl.formatMessage(messages.endDate)}
        <input
          value={value?.lte || ''}
          type="date"
          className="form-control"
          onChange={(e) => onInputChange('lte', e.target.value)}
          min={value?.gte}
        />
      </label>
    </div>
  );
}

export default React.forwardRef(SimpleDateRangeField);
