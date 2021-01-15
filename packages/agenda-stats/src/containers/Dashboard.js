import _ from 'lodash';
import React, {
  useCallback, useEffect, useRef, useState
} from 'react';
import { hot } from 'react-hot-loader/root';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useLatest, useUpdateEffect } from 'react-use';
import qs from 'qs';
import { MoreInfo, Spinner } from '@openagenda/react-components';
import { useApiClient, useModal } from '@openagenda/react-shared';
import {
  FiltersProvider,
  Filters,
  DateRangeFilter,
  MultiChoiceFilter,
} from '@openagenda/react-filters';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import * as statsActions from '../reducers/stats';
import OrderModal from '../components/OrderModal';
import AggregationCharts from '../components/AggregationCharts';
import PulseChart from '../components/PulseChart';
import determineDefaultRange from '../utils/determineDefaultRange';
import useFilters from '../hooks/useFilters';

const messages = defineMessages({
  save: {
    id: 'AgendaStats.Dashboard.save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'AgendaStats.Dashboard.cancel',
    defaultMessage: 'Cancel',
  },
  edit: {
    id: 'AgendaStats.Dashboard.edit',
    defaultMessage: 'Edit',
  },
  changeOrder: {
    id: 'AgendaStats.Dashboard.changeOrder',
    defaultMessage: 'Change ordrer',
  },
  pulseDesc: {
    id: 'AgendaStats.Dashboard.pulseDesc',
    defaultMessage: 'Past year of activity',
  },
  moreFilters: {
    id: 'AgendaStats.Dashboard.moreFilters',
    defaultMessage: 'Display more filters',
  },
  lessFilters: {
    id: 'AgendaStats.Dashboard.lessFilters',
    defaultMessage: 'Display less filters',
  },
});

function FiltersPart({ agenda, agendaSchema }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();

  const filtersFormRef = useRef();

  const stats = useSelector(state => state.stats.data);
  const loading = useSelector(state => state.stats.loading);
  const query = useSelector(state => state.stats.query);
  const latestStats = useLatest(stats);
  const latestQuery = useLatest(query);

  const [initialQuery] = useState(query);

  const standardsFilters = useFilters(agendaSchema, { standards: true });
  const additionalsFilters = useFilters(agendaSchema, { additionals: true });

  const [moreFilters, setMoreFilters] = useState(() => {
    const names = additionalsFilters.map(v => v.name);

    for (const key in query) {
      if (
        Object.prototype.hasOwnProperty.call(query, key)
        && names.includes(key)
      ) {
        return true;
      }
    }

    return false;
  });

  const getTotal = useCallback(
    (filter, option) => {
      const stat = stats.find(s => _.isMatch(s.aggregation, {
        type: filter.name,
        ...filter.aggregation,
      }));

      if (!stat) return 0;

      const { data } = stat.state;

      if (!data) return 0;

      const dataKey = 'id' in option ? 'id' : 'key';
      const optionKey = 'id' in option ? 'id' : 'value';

      const optionValue = data.find(v => v[dataKey] === option[optionKey]);

      if (optionValue) {
        return optionValue.eventCount || 0;
      }

      return 0;
    },
    [stats]
  );

  const getOptions = useCallback(
    filter => {
      if (filter.options) return filter.options;

      const stat = stats.find(s => _.isMatch(s.aggregation, {
        type: filter.name,
        ...filter.aggregation,
      }));

      if (!stat) return [];

      return stat.state.data.map(v => ({
        label: v.key,
        value: v.key,
      }));
    },
    [stats]
  );

  // TODO moreOptions

  const onFilterChange = useCallback(
    async values => dispatch(
      statsActions.load(
        agenda,
        latestStats.current,
        [...standardsFilters, ...additionalsFilters],
        values
      )
    ).then(() => {
      history.push({
        ...history.location,
        search: qs.stringify(values, { arrayFormat: 'brackets' }),
      });
    }),
    [
      additionalsFilters,
      agenda,
      dispatch,
      history,
      latestStats,
      standardsFilters,
    ]
  );

  const toggleMoreFilters = useCallback(
    () => setMoreFilters(prevState => !prevState),
    []
  );

  useUpdateEffect(() => {
    const search = qs.stringify(latestQuery.current, {
      addQueryPrefix: true,
      arrayFormat: 'brackets',
    });

    if (history.location.search !== search) {
      const baseQuery = qs.parse(history.location.search, {
        ignoreQueryPrefix: true,
      });
      const cleanQuery = _.pick(
        validateQuery(baseQuery, agendaSchema),
        Object.keys(baseQuery)
      );

      filtersFormRef.current.initialize(cleanQuery);
    }
  }, [
    additionalsFilters,
    agenda,
    agendaSchema,
    dispatch,
    history.location,
    latestQuery,
    latestStats,
    standardsFilters,
  ]);

  return (
    <FiltersProvider
      onSubmit={onFilterChange}
      initialValues={initialQuery}
      intl={intl}
      ref={filtersFormRef}
    >
      <div className="oa-collapse">
        <Filters
          filters={standardsFilters}
          disabled={loading}
          dateRangeComponent={DateRangeFilter}
          checkboxComponent={MultiChoiceFilter}
          radioComponent={MultiChoiceFilter}
          getTotal={getTotal}
          getOptions={getOptions}
        />
        {moreFilters ? (
          <Filters
            filters={additionalsFilters}
            disabled={loading}
            dateRangeComponent={DateRangeFilter}
            checkboxComponent={MultiChoiceFilter}
            radioComponent={MultiChoiceFilter}
            getTotal={getTotal}
            getOptions={getOptions}
          />
        ) : null}
        {additionalsFilters.length ? (
          <div className="margin-v-xs">
            <button
              type="button"
              className="btn btn-link-inline"
              onClick={toggleMoreFilters}
            >
              {intl.formatMessage(
                moreFilters ? messages.lessFilters : messages.moreFilters
              )}
            </button>
          </div>
        ) : null}
      </div>
    </FiltersProvider>
  );
}

function Dashboard({ agenda, agendaSchema }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();
  const history = useHistory();

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
    dispatch,
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
      aggregations: ['timespan'],
    };

    Promise.all([
      apiClient.get(configUrl),
      apiClient.get(exportUrl, { params }),
    ]).then(([configResult, timespanResult]) => {
      const { first, last } = timespanResult.data.aggregations.timespan;
      let initialQuery;

      if (history.location.search) {
        const baseQuery = qs.parse(history.location.search, {
          ignoreQueryPrefix: true,
        });

        initialQuery = _.pick(
          validateQuery(baseQuery, agendaSchema),
          Object.keys(baseQuery)
        );
      } else {
        // Timespan is a `timings` query
        initialQuery = {
          timings: determineDefaultRange({ first, last }),
        };
      }

      return dispatch(
        statsActions.load(agenda, configResult.data, filters, initialQuery)
      );
    });
  }, [
    agenda,
    agendaSchema,
    apiClient,
    dispatch,
    filters,
    history.location.search,
    loaded,
    res.jsonExport,
  ]);

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
                total: totalEvents,
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
                marginRight: 'auto',
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
