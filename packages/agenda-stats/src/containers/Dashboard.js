import _ from 'lodash';
import React, { useEffect, useState, useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
import { useIntl, defineMessages } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { isSameDay } from 'date-fns';
import Spinner from '@openagenda/react-components/build/Spinner';
import { useModal } from '@openagenda/react-shared';
// import useApiClient from '@openagenda/react-utils/dist/useApiClient';
import * as statsActions from '../reducers/stats';
import OriginAgendasChart from '../components/OriginAgendasChart';
import PeriodModal from '../components/PeriodModal';
import dateRanges from '../dateRanges';

const messages = defineMessages({
  title: {
    id: 'AgendaStats.Dashboard.title',
    defaultMessage: 'Statistics'
  },
  sameDayRange: {
    id: 'AgendaStats.Dashboard.sameDayRange',
    defaultMessage: 'The {startDate, date}'
  },
  range: {
    id: 'AgendaStats.Dashboard.range',
    defaultMessage: 'From {startDate, date} to {endDate, date}'
  }
});

function Dashboard({ user, agenda }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  // const apiClient = useApiClient();

  const loading = useSelector(state => _.get(state, 'stats.loading', true));
  const loaded = useSelector(state => _.get(state, 'stats.loaded'));
  const aggregations = useSelector(state => state.stats.data);

  const { staticRanges } = useMemo(() => dateRanges(intl), [intl]);

  const [range, setRange] = useState({
    ...staticRanges[2].range(),
    key: 'selection'
  });

  const dateRangeModal = useModal();

  useEffect(() => {
    const query = {};

    if (range) {
      _.set(query, 'date.gte', range.startDate);
      _.set(query, 'date.lte', range.endDate);
    }

    dispatch(statsActions.load(agenda, query));
  }, [dispatch, user, agenda, range]);

  if (loading && !loaded) {
    return (
      <div className="padding-v-md" css={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h2>{intl.formatMessage(messages.title)}</h2>

      <div>
        {range ? (
          <>
            {isSameDay(range.startDate, range.endDate) ? (
              <>{intl.formatMessage(messages.sameDayRange, range)}</>
            ) : (
              <>{intl.formatMessage(messages.range, range)}</>
            )}
          </>
        ) : null}

        <button
          type="button"
          className="btn btn-link-inline margin-left-sm"
          onClick={() => dateRangeModal.open()}
        >
          Modifier
        </button>
      </div>

      {aggregations.originAgendas?.length ? (
        <OriginAgendasChart data={aggregations.originAgendas} />
      ) : null}

      {/* <pre>{JSON.stringify(Object.keys(aggregations), null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(aggregations.originAgendas, null, 2)}</pre> */}

      {dateRangeModal.isOpen ? (
        <PeriodModal
          initialValues={[range]}
          onSubmit={value => {
            setRange(value[0]);
            dateRangeModal.close();
          }}
          onClose={() => dateRangeModal.close()}
        />
      ) : null}
    </div>
  );
}

export default hot(Dashboard);
