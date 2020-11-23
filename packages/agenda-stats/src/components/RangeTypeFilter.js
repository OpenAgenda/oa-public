import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { useModal } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
import RangeTypeModal from './RangeTypeModal';

const messages = defineMessages({
  sameDayRange: {
    id: 'AgendaStats.RangeTypeFilter.sameDayRange',
    defaultMessage: 'The {startDate, date}'
  },
  range: {
    id: 'AgendaStats.RangeTypeFilter.range',
    defaultMessage: 'From {startDate, date} to {endDate, date}'
  },
  submit: {
    id: 'AgendaStats.RangeTypeFilter.submit',
    defaultMessage: 'Update'
  },
  //
  typeDate: {
    id: 'AgendaStats.RangeTypeFilter.typeDate',
    defaultMessage: 'By timing'
  },
  typeCreatedAt: {
    id: 'AgendaStats.RangeTypeFilter.typeCreatedAt',
    defaultMessage: 'By creation'
  }
});

export default function RangeTypeFilter({ agenda }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const stats = useSelector(state => state.stats.data);
  const range = useSelector(state => state.stats.range);
  const rangeType = useSelector(state => state.stats.rangeType);

  const rangeTypeModal = useModal();

  const onSubmit = useCallback(
    values => dispatch(
      statsActions.load(agenda, stats, { rangeType: values.rangeType })
    ).then(() => {
      rangeTypeModal.close();
    }),
    [agenda, dispatch, rangeTypeModal, stats]
  );

  return (
    <>
      {rangeType ? (
        <>
          {rangeType === 'timings'
            ? intl.formatMessage(messages.typeDate)
            : null}
          {rangeType === 'createdAt'
            ? intl.formatMessage(messages.typeCreatedAt)
            : null}

          <button
            type="button"
            className="btn btn-link-inline margin-left-sm"
            onClick={() => rangeTypeModal.open()}
          >
            {intl.formatMessage(messages.submit)}
          </button>
        </>
      ) : null}

      {rangeTypeModal.isOpen ? (
        <RangeTypeModal
          range={range}
          initialValues={{ rangeType }}
          onSubmit={onSubmit}
          onClose={rangeTypeModal.close}
        />
      ) : null}
    </>
  );
}
