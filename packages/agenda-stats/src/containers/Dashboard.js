import _ from 'lodash';
import React, {
  useCallback, useEffect, useRef, useState
} from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLatest } from 'react-use';
import { useHistory } from 'react-router';
import { useQuery } from 'react-query';
import qs from 'qs';
import { FiltersProvider } from '@openagenda/react-filters';
import { MoreInfo, Spinner } from '@openagenda/react-components';
import { useApiClient, useModal } from '@openagenda/react-shared';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import * as statsActions from '../reducers/stats';
import FiltersPart from '../components/FiltersPart';
import FiltersPreview from '../components/FiltersPreview';
import OrderModal from '../components/OrderModal';
import AggregationCharts from '../components/AggregationCharts';
import PulseChart from '../components/PulseChart';
import determineDefaultRange from '../utils/determineDefaultRange';
import useFilters from '../hooks/useFilters';
import getEvents from '../api/getEvents';

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

function Dashboard({ agenda, agendaSchema, filtersContainerRef }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();
  const history = useHistory();

  const filtersFormRef = useRef();

  const res = useSelector(state => state.res);
  const loading = useSelector(state => _.get(state, 'stats.loading'));
  const loaded = useSelector(state => _.get(state, 'stats.loaded'));
  const totalEvents = useSelector(state => state.stats.totalEvents);
  const editing = useSelector(state => state.stats.editing);
  const stats = useSelector(state => state.stats.data);

  const latestStats = useLatest(stats);

  const [initialQuery, setInitialQuery] = useState(() => {
    const baseQuery = qs.parse(history.location.search, {
      ignoreQueryPrefix: true,
    });

    return _.pick(
      validateQuery(baseQuery, agendaSchema),
      Object.keys(baseQuery)
    );
  });

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

  const standardsFilters = useFilters(agendaSchema, { standards: true });
  const additionalsFilters = useFilters(agendaSchema, { additionals: true });

  const filtersQuery = useQuery(
    'filters-base',
    () => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      [...standardsFilters, ...additionalsFilters].filter(
        filter => filter.type !== 'dateRange'
      ),
      { size: 0 }
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    }
  );

  const onFilterChange = useCallback(
    async values => dispatch(
      statsActions.load(
        agenda,
        latestStats.current,
        [...standardsFilters, ...additionalsFilters],
        values
      )
    ).then(() => {
      const search = qs.stringify(values, {
        addQueryPrefix: true,
        arrayFormat: 'brackets',
      });

      if (history.location.search !== search) {
        history.push({
          ...history.location,
          search,
        });
      }
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

  // Load timespan & aggregations
  useEffect(() => {
    if (loading || loaded) {
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

        setInitialQuery(defaultQuery);

        return dispatch(
          statsActions.load(
            agenda,
            configResult.data,
            [...standardsFilters, ...additionalsFilters],
            defaultQuery
          )
        );
      }

      return dispatch(
        statsActions.load(
          agenda,
          configResult.data,
          [...standardsFilters, ...additionalsFilters],
          initialQuery
        )
      );
    });
  }, [
    agenda,
    agendaSchema,
    apiClient,
    dispatch,
    standardsFilters,
    additionalsFilters,
    history.location.search,
    initialQuery,
    loaded,
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
            <FormattedMessage
              id="AgendaStats.Dashboard.totalEvents"
              defaultMessage="{total, number} {total, plural, =0 {event} one {event} other {events}}"
              values={{
                total: totalEvents,
              }}
            />
          ) : null}

          <span className="oa-filter-value-preview">
            <FiltersPreview
              isFetching={loading}
              agenda={agenda}
              standardsFilters={standardsFilters}
              additionalsFilters={additionalsFilters}
            />
          </span>
        </div>
      </div>

      <div className="clearfix" />

      <AggregationCharts agenda={agenda} agendaSchema={agendaSchema} />

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
            agenda={agenda}
            agendaSchema={agendaSchema}
            standardsFilters={standardsFilters}
            additionalsFilters={additionalsFilters}
            filtersFormRef={filtersFormRef}
            initialQuery={initialQuery}
          />
        </div>,
        filtersContainerRef.current
      )}
    </FiltersProvider>
  );
}

export default hot(Dashboard);
