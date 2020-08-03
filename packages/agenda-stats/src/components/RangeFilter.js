import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { isSameDay } from 'date-fns';
import { useModal } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
import RangeModal from './RangeModal';

const messages = defineMessages({
  sameDayRange: {
    id: 'AgendaStats.RangeFilter.sameDayRange',
    defaultMessage: 'The {startDate, date}'
  },
  range: {
    id: 'AgendaStats.RangeFilter.range',
    defaultMessage: 'From {startDate, date} to {endDate, date}'
  },
  update: {
    id: 'AgendaStats.RangeFilter.update',
    defaultMessage: 'Update'
  }
});

export default function RangeFilter({ agenda }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const stats = useSelector(state => state.stats.data);
  const range = useSelector(state => state.stats.range);

  const rangeModal = useModal();

  const onSubmit = useCallback(
    values => dispatch(statsActions.load(agenda, stats, { range: values.range[0] })),
    [agenda, dispatch, stats]
  );

  return (
    <>
      {range ? (
        <>
          {isSameDay(range.startDate, range.endDate) ? (
            <>{intl.formatMessage(messages.sameDayRange, range)}</>
          ) : (
            <>{intl.formatMessage(messages.range, range)}</>
          )}

          <button
            type="button"
            className="btn btn-link-inline margin-left-sm"
            onClick={() => rangeModal.open()}
          >
            {intl.formatMessage(messages.update)}
          </button>
        </>
      ) : null}

      {rangeModal.isOpen ? (
        <RangeModal
          initialValues={{ range }}
          onSubmit={onSubmit}
          onClose={rangeModal.close}
        />
      ) : null}
    </>
  );
}
