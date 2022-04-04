import _ from 'lodash';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import ReactDOM from 'react-dom';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLatest } from 'react-use';
import { useHistory, useLocation } from 'react-router';
import { useQuery } from 'react-query';
import qs from 'qs';
import {
  FiltersProvider,
  useFilters,
  getEvents,
} from '@openagenda/react-filters';
import {
  useApiClient,
  useLayoutData,
  useModal,
  MoreInfo,
  Spinner,
  getLocaleValue,
} from '@openagenda/react-shared';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import * as statsActions from '../reducers/stats';
import FiltersPart from '../components/FiltersPart';
import FiltersPreview from '../components/FiltersPreview';
import OrderModal from '../components/OrderModal';
import AggregationCharts from '../components/AggregationCharts';
import PulseChart from '../components/PulseChart';
import determineDefaultRange from '../utils/determineDefaultRange';
import emptyOptionMessage from '../messages/emptyOption';

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
  filters: {
    id: 'AgendaStats.Dashboard.filters',
    defaultMessage: 'Filters',
  },
});

function Dashboard() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();
  const history = useHistory();
  const location = useLocation();

  const filtersFormRef = useRef();

  const { agenda, agendaSchema, filtersContainerRef } = useLayoutData();

  const res = useSelector(state => state.res);
  const loading = useSelector(state => _.get(state, 'stats.loading'));
  const loaded = useSelector(
    state => _.get(state, 'stats.agendaUid') === agenda.uid
  );
  const error = useSelector(state => _.get(state, 'stats.error'));
  const totalEvents = useSelector(state => state.stats.totalEvents);
  const editing = useSelector(state => state.stats.editing);
  const stats = useSelector(state => state.stats.data);

  const latestStats = useLatest(stats);

  const parsedLocationSearch = useMemo(
    () => qs.parse(location.search, {
      ignoreQueryPrefix: true,
    }),
    [location.search]
  );

  const [initialQuery, setInitialQuery] = useState(() => _.pick(
    parsedLocationSearch,
    Object.keys(
      validateQuery(parsedLocationSearch, {
        formSchema: agendaSchema,
        emptyValue: 'null',
      })
    )
  ));

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
  const save = useCallback(
    () => dispatch(statsActions.save(agenda)),
    [agenda, dispatch]
  );

  const filters = useFilters(intl, agendaSchema, { missingValue: 'null' });

  const filtersQuery = useQuery(
    ['agenda-stats', 'filtersBase', agenda.slug],
    () => getEvents(apiClient, res.jsonExport, agenda, filters, { size: 0 }, true),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    }
  );

  const { aggregations: filtersBase } = filtersQuery.data ?? {};

  // A ref to conserve the same onFilterChange callback
  const latestLocation = useLatest(location);

  const onFilterChange = useCallback(
    async values => dispatch(
      statsActions.load(agenda, latestStats.current, filters, values)
    ).then(() => {
      const search = qs.stringify(values, {
        addQueryPrefix: true,
        arrayFormat: 'brackets',
      });

      if (latestLocation.current.search !== search) {
        history.push({ search });
      }
    }),
    [filters, agenda, dispatch, history, latestLocation, latestStats]
  );

  const getOptions = useCallback(
    filter => {
      const missingLabel = intl.formatMessage(emptyOptionMessage);

      if (filter.options) {
        const missingOption = filter.missingValue
          ? filtersBase[filter.name]?.find(v => {
            const dataKey = 'id' in v ? 'id' : 'key';
            return v[dataKey] === filter.missingValue;
          })
          : null;

        return missingOption
          ? [
            {
              label: missingLabel,
              key: filter.missingValue,
              value: filter.missingValue,
            },
          ].concat(filter.options)
          : filter.options;
      }

      if (!filtersBase[filter.name]) return [];

      const baseAgg = [...filtersBase[filter.name]];

      const aggregation = stats.find(s => _.isMatch(
        s.aggregation,
        _.omit(
          {
            type: filter.name,
            ...filter.aggregation,
          },
          'size'
        )
      ))?.state?.data;

      if (aggregation) {
        aggregation.forEach(entry => {
          const dataKey = 'id' in entry ? 'id' : 'key';
          const found = baseAgg.find(v => v[dataKey] === entry[dataKey]);
          if (!found) baseAgg.push(entry);
        });
      }

      const labelKey = filter.labelKey || 'key';

      return baseAgg.map(entry => {
        const dataKey = 'id' in entry ? 'id' : 'key';
        const labelValue = _.get(entry, labelKey);

        return {
          ...entry,
          label:
            labelValue === filter.missingValue
              ? missingLabel
              : getLocaleValue(labelValue),
          value: String(entry[dataKey]),
        };
      });
    },
    [filtersBase, intl, stats]
  );

  // Load timespan & aggregations
  useEffect(() => {
    if (loading || loaded || error) {
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

      if (!Object.keys(initialQuery).length) {
        // Timespan is a `timings` query
        const defaultQuery = {
          timings: determineDefaultRange({ first, last }),
        };

        return dispatch(
          statsActions.load(agenda, configResult.data, filters, defaultQuery)
        ).then(() => setInitialQuery(defaultQuery));
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
    location.search,
    initialQuery,
    loaded,
    error,
    loading,
    res.jsonExport,
  ]);

  if (!loaded || filtersQuery.isFetching) {
    return (
      <div className="padding-v-md" css={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  if (filtersQuery.error) {
    throw filtersQuery.error;
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
    <FiltersProvider
      onSubmit={onFilterChange}
      initialValues={initialQuery}
      // validate={validate}
      intl={intl}
      ref={filtersFormRef}
      filters={filters}
    >
      <div className="row margin-top-sm">
        <div className="col-sm-6">
          <MoreInfo
            id="pulse-chart-more-info"
            content={intl.formatMessage(messages.pulseDesc)}
            placement="bottom"
          >
            <div
              css={{
                width: '155px',
                display: 'block',
                // marginLeft: 'auto',
                // marginRight: 'auto',
              }}
            >
              <PulseChart agendaUid={agenda.uid} />
            </div>
          </MoreInfo>
        </div>

        <div className="col-sm-6 text-right">
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

      <div className="row margin-top-xs">
        <div className="col-xs-12">
          {typeof totalEvents === 'number' ? (
            <span className="margin-right-xs">
              <FormattedMessage
                id="AgendaStats.Dashboard.totalEvents"
                defaultMessage="{total, number} {total, plural, =0 {event} one {event} other {events}}"
                values={{
                  total: totalEvents,
                }}
              />
            </span>
          ) : null}

          <span className="oa-filter-value-preview">
            <FiltersPreview
              isFetching={loading}
              agenda={agenda}
              filters={filters}
              getOptions={getOptions}
            />
          </span>
        </div>
      </div>

      <div className="clearfix" />

      <AggregationCharts />

      <div className="margin-top-md text-right">{editButtons}</div>

      {orderModal.isOpen ? (
        <OrderModal onSubmit={onOrderChange} onClose={orderModal.close} />
      ) : null}

      {ReactDOM.createPortal(
        <div>
          <div className="margin-bottom-xs">
            <b>{intl.formatMessage(messages.filters)}</b>
          </div>

          <FiltersPart
            filters={filters}
            filtersFormRef={filtersFormRef}
            initialQuery={initialQuery}
            getOptions={getOptions}
          />
        </div>,
        filtersContainerRef.current
      )}
    </FiltersProvider>
  );
}

export default Dashboard;
