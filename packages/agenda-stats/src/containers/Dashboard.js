import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { MoreInfo, Spinner } from '@openagenda/react-components';
import { useApiClient, useModal } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
import OrderModal from '../components/OrderModal';
import AggregationCharts from '../components/AggregationCharts';
import determineDefaultRange from '../utils/determineDefaultRange';
import PulseChart from '../components/PulseChart';
import RangeFilter from './RangeFilter';

const messages = defineMessages({
  save: {
    id: 'AgendaStats.Dashboard.save',
    defaultMessage: 'Save'
  },
  cancel: {
    id: 'AgendaStats.Dashboard.cancel',
    defaultMessage: 'Cancel'
  },
  edit: {
    id: 'AgendaStats.Dashboard.edit',
    defaultMessage: 'Edit'
  },
  changeOrder: {
    id: 'AgendaStats.Dashboard.changeOrder',
    defaultMessage: 'Change ordrer'
  },
  pulseDesc: {
    id: 'AgendaStats.Dashboard.pulseDesc',
    defaultMessage: 'Past year of activity'
  }
});

function Dashboard({ agenda, agendaSchema }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();

  const res = useSelector(state => state.res);
  const loading = useSelector(state => _.get(state, 'stats.loading', true));
  const loaded = useSelector(state => _.get(state, 'stats.loaded'));
  const stats = useSelector(state => state.stats.data);
  const range = useSelector(state => state.stats.range);
  const totalEvents = useSelector(state => state.stats.totalEvents);
  const editing = useSelector(state => state.stats.editing);

  const orderModal = useModal();

  const onOrderChange = useCallback(
    statIds => dispatch(statsActions.reorderStats(statIds)),
    [dispatch]
  );

  const setEditMode = useCallback(
    () => dispatch(statsActions.setEditMode(true)),
    [dispatch]
  );
  const cancelEdit = useCallback(
    () => dispatch(statsActions.setEditMode(false)),
    [dispatch]
  );
  const save = useCallback(() => dispatch(statsActions.save(agenda)), [
    agenda,
    dispatch
  ]);

  // Load timespan & aggregations
  useEffect(() => {
    if (loaded) {
      return;
    }

    const configUrl = `/${agenda.slug}/admin/statistics/config`;
    const exportUrl = res.jsonExport
      .replace(':slug', agenda.slug)
      .replace(':uid', agenda.uid);

    const params = {
      oaq: { passed: 1 },
      size: 0,
      aggregations: ['timespan']
    };

    Promise.all([
      apiClient.get(configUrl),
      apiClient.get(exportUrl, { params })
    ]).then(([configResult, timespanResult]) => {
      const { first, last } = timespanResult.data.aggregations.timespan;

      const defaultRange = determineDefaultRange({ first, last });

      const query = {};
      _.set(query, 'date.gte', defaultRange.startDate);
      _.set(query, 'date.lte', defaultRange.endDate);

      const statsToLoad = configResult.data;

      return dispatch(
        statsActions.load(agenda, statsToLoad, query, defaultRange)
      );
    });
  }, [agenda, apiClient, dispatch, loaded, res.jsonExport]);

  if (!stats?.length && loading) {
    return (
      <div className="padding-v-md" css={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  const editButtons = editing ? (
    <>
      <button type="button" className="btn btn-primary" onClick={save}>
        {intl.formatMessage(messages.save)}
      </button>
      <button
        type="button"
        className="btn btn-danger btn-bordered margin-left-sm"
        onClick={cancelEdit}
      >
        {intl.formatMessage(messages.cancel)}
      </button>
    </>
  ) : (
    <button type="button" className="btn btn-default" onClick={setEditMode}>
      {intl.formatMessage(messages.edit)}
    </button>
  );

  return (
    <div>
      <div className="row">
        <div className="col-sm-4">
          <RangeFilter agenda={agenda} />
        </div>

        <div className="col-sm-4">
          <MoreInfo
            id="pulse-chart-more-info"
            content={intl.formatMessage(messages.pulseDesc)}
            placement="bottom"
          >
            <div
              css={{
                width: '155px',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              <PulseChart agendaUid={agenda.uid} />
            </div>
          </MoreInfo>
        </div>

        <div className="col-sm-4 text-right">
          <div>{editButtons}</div>
          {editing ? (
            <button
              type="button"
              className="btn btn-link btn-link-inline margin-top-sm"
              onClick={() => orderModal.open()}
            >
              {intl.formatMessage(messages.changeOrder)}
            </button>
          ) : null}
        </div>
      </div>

      {typeof totalEvents === 'number' ? (
        <div className="margin-top-xs">
          <FormattedMessage
            id="AgendaStats.Dashboard.totalEvents"
            defaultMessage="{total, number} {total, plural, =0 {event} one {event} other {events}}"
            values={{
              total: totalEvents
            }}
          />
        </div>
      ) : null}

      <div className="clearfix" />

      {stats ? (
        <AggregationCharts
          agenda={agenda}
          stats={stats}
          totalEvents={totalEvents}
          range={range}
          editMode={editing}
          agendaSchema={agendaSchema}
        />
      ) : null}

      <div className="margin-top-md text-right">{editButtons}</div>

      {orderModal.isOpen ? (
        <OrderModal
          initialStats={stats}
          onSubmit={onOrderChange}
          onClose={orderModal.close}
        />
      ) : null}
    </div>
  );
}

export default hot(Dashboard);
