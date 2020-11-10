import _ from 'lodash';
import React, {
  useCallback, useEffect, useMemo, useState
} from 'react';
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
import getLocaleValue from '../utils/getLocaleValue';
import stateMessages from '../messages/states';

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

  const stateOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(stateMessages.refused),
        value: -1
      },
      {
        label: intl.formatMessage(stateMessages.tocontrol),
        value: 0
      },
      {
        label: intl.formatMessage(stateMessages.controlled),
        value: 1
      },
      {
        label: intl.formatMessage(stateMessages.published),
        value: 2
      }
    ],
    [intl]
  );

  const [initialQuery] = useState(query);

  const filters = useMemo(() => {
    const basicFilters = [
      { name: 'timings', type: 'dateRange' },
      { name: 'createdAt', type: 'dateRange' },
      { name: 'updatedAt', type: 'dateRange' },
      { name: 'state', type: 'radio', options: stateOptions }
    ];

    const additionalFieldFilters = agendaSchema.fields
      .filter(
        fieldSchema => fieldSchema.options && fieldSchema.options.length > 0
      )
      .map(fieldSchema => ({
        name: fieldSchema.field,
        type: fieldSchema.fieldType,
        label: getLocaleValue(fieldSchema.label, intl.locale),
        options: fieldSchema.options.map(option => ({
          ...option,
          value: option.id
        }))
      }));

    return basicFilters.concat(additionalFieldFilters);
  }, [agendaSchema.fields, intl.locale, stateOptions]);

  const onFilterChange = useCallback(
    // TODO should reload aggregations (managed by react-filters in future)
    async values => dispatch(statsActions.load(agenda, latestStats.current, values)),
    [agenda, dispatch, latestStats]
  );

  return (
    <FiltersProvider onSubmit={onFilterChange} initialValues={initialQuery}>
      <div className="rc-collapse">
        <Filters
          filters={filters}
          loading={loading}
          dateRangeComponent={DateRangeFilter}
          checkboxComponent={MultiChoiceFilter}
          radioComponent={MultiChoiceFilter}
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
      // TODO update query instead of load directly
      // TODO mark as readyToLoad
      // TODO if readyToLoad and not loaded then load

      return dispatch(
        statsActions.load(agenda, configResult.data, {
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
