import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLatest } from 'react-use';
import { MoreInfo, Spinner } from '@openagenda/react-components';
import { useApiClient, useModal } from '@openagenda/react-shared';
import {
  FiltersProvider,
  Filters,
  DateRangeFilter,
  MultiChoiceFilter
} from '@openagenda/react-filters';
import * as statsActions from '../reducers/stats';
import OrderModal from '../components/OrderModal';
import AggregationCharts from '../components/AggregationCharts';
import PulseChart from '../components/PulseChart';
import determineDefaultRange from '../utils/determineDefaultRange';
import useFilters from '../hooks/useFilters';

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

function FiltersPart({ agenda, agendaSchema }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const stats = useSelector(state => state.stats.data);
  const loading = useSelector(state => state.stats.loading);
  const query = useSelector(state => state.stats.query);
  const latestStats = useLatest(stats);

  const [initialQuery] = useState(query);

  const filters = useFilters(agendaSchema);
  const getTotal = useCallback(
    (filter, option) => {
      const stat = stats.find(s => _.isMatch(s.aggregation, {
        type: filter.name,
        ...filter.aggregation
      }));

      if (!stat) return null;

      const { data } = stat.state;

      if (!data) return null;

      if (filter.name === 'state') {
        const stateValue = data.find(v => v.key === option.value);

        return stateValue?.eventCount || 0;
      }

      const optionValue = data.find(
        v => v.key === option.value || v.id === option.id
      );

      if (optionValue) {
        return optionValue?.eventCount || 0;
      }

      return 0;
    },
    [filters, stats]
  );

  const onFilterChange = useCallback(
    async values => dispatch(statsActions.load(agenda, latestStats.current, filters, values)),
    [agenda, dispatch, latestStats]
  );

  return (
    <FiltersProvider
      onSubmit={onFilterChange}
      initialValues={initialQuery}
      locale={intl.locale}
    >
      <div className="oa-collapse">
        <Filters
          filters={filters}
          loading={loading}
          dateRangeComponent={DateRangeFilter}
          checkboxComponent={MultiChoiceFilter}
          radioComponent={MultiChoiceFilter}
          getTotal={getTotal}
        />
      </div>
    </FiltersProvider>
  );
}

function Dashboard({ agenda, agendaSchema }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();

  const res = useSelector(state => state.res);
  const loaded = useSelector(state => _.get(state, 'stats.loaded'));
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

  const filters = useFilters(agendaSchema);

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

      // Timespan is a `timings` query
      return dispatch(
        statsActions.load(agenda, configResult.data, filters, {
          timings: determineDefaultRange({ first, last })
        })
      );
    });
  }, [agenda, apiClient, dispatch, loaded, res.jsonExport]);

  if (!loaded) {
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
    <>
      <FiltersPart agenda={agenda} agendaSchema={agendaSchema} />

      <div className="row margin-top-sm">
        <div className="col-sm-4 margin-top-xs">
          {typeof totalEvents === 'number' ? (
            <FormattedMessage
              id="AgendaStats.Dashboard.totalEvents"
              defaultMessage="{total, number} {total, plural, =0 {event} one {event} other {events}}"
              values={{
                total: totalEvents
              }}
            />
          ) : null}
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

      <div className="clearfix" />

      <AggregationCharts agenda={agenda} agendaSchema={agendaSchema} />

      <div className="margin-top-md text-right">{editButtons}</div>

      {orderModal.isOpen ? (
        <OrderModal onSubmit={onOrderChange} onClose={orderModal.close} />
      ) : null}
    </>
  );
}

export default hot(Dashboard);
