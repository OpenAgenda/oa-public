import _ from 'lodash';
import qs from 'qs';
import { useCallback, useMemo, useState, useRef, useLayoutEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';
import { defineMessages, useIntl } from 'react-intl';
import useLatestModule from 'react-use/lib/useLatest.js';
import useUpdateEffectModule from 'react-use/lib/useUpdateEffect.js';
import { useSelector } from 'react-redux';
import { Base64 } from 'js-base64';
import * as dateFnsLocales from 'date-fns/locale/index.js';
import {
  a11yButtonActionHandler,
  useApiClient,
  useModal,
  useLayoutData,
  Spinner,
} from '@openagenda/react-shared';
import {
  FiltersProvider,
  SearchFilter,
  getEvents,
  useFilters,
  useGetFilterOptions,
  Sort,
} from '@openagenda/react-filters';
import validateQuery from '@openagenda/event-search/utils/validateQuery.js';
import FiltersPortal from '../components/FiltersPortal.js';
import FiltersPreview from '../components/FiltersPreview.js';
import EmptyDashboard from '../components/EmptyDashboard.js';
import RemoveModal from '../components/RemoveModal.js';
import EventItem from '../components/EventItem.js';
import Actions from '../components/Actions.js';
import exportsMessages from '../messages/exports.js';
import BatchedStateSelector from '../components/BatchedStateSelector.js';
import Pager from '../components/Pager.js';
import removeQueryPrefix from '../utils/removeQueryPrefix.js';
import addQueryPrefix from '../utils/addQueryPrefix.js';
import flattenAgendaSchema from '../utils/flattenAgendaSchema.js';
import ExportsDropdown from '../components/ExportsDropdown.js';

const useLatest = useLatestModule.default || useLatestModule;
const useUpdateEffect = useUpdateEffectModule.default || useUpdateEffectModule;

const PAGE_SIZE = 20;

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4,
};

const sortOptions = [
  'score',
  'timings.asc',
  'updatedAt.desc',
  'lastTimingWithFeatured.asc',
];

const getRedirectURL = (location) =>
  Base64.encode(location.pathname + location.search);

const messages = defineMessages({
  totalEvents: {
    id: 'EventAdminApp.Dashboard.totalEvents',
    defaultMessage:
      '<strong>{total, number}</strong> {total, plural, =0 {event} one {event} other {events}}',
  },
  totalWithFilters: {
    id: 'EventAdminApp.Dashboard.totalWithFilters',
    defaultMessage:
      '<strong>{selection, number}</strong> / <strong>{total, number}</strong> {total, plural, =0 {event} one {event} other {events}}',
  },
  searchPlaceholder: {
    id: 'EventAdminApp.Dashboard.searchPlaceholder',
    defaultMessage: 'Search',
  },
  sortedBy: {
    id: 'EventAdminApp.Dashboard.sortedBy',
    defaultMessage: 'Sorted by:',
  },
  selectAll: {
    id: 'EventAdminApp.Dashboard.selectAll',
    defaultMessage: 'Select all',
  },
  allSelected: {
    id: 'EventAdminApp.Dashboard.allSelected',
    defaultMessage: 'All <b>{size}</b> events on this page are selected.',
  },
  selectExtendedAll: {
    id: 'EventAdminApp.Dashboard.selectExtendedAll',
    defaultMessage:
      'Select <b>{total}</b> events matching the current filters.',
  },
  extendedAllSelected: {
    id: 'EventAdminApp.Dashboard.extendedAllSelected',
    defaultMessage:
      'The <b>{total}</b> events corresponding to the current filters are selected.',
  },
  cancelSelection: {
    id: 'EventAdminApp.Dashboard.cancelSelection',
    defaultMessage: 'Cancel selection',
  },
  groupedActions: {
    id: 'EventAdminApp.Dashboard.groupedActions',
    defaultMessage: 'Grouped actions',
  },
  state: {
    id: 'EventAdminApp.Dashboard.state',
    defaultMessage: 'State',
  },
  changeState: {
    id: 'EventAdminApp.Dashboard.changeState',
    defaultMessage: 'Change state',
  },
  yourSelection: {
    id: 'EventAdminApp.Dashboard.yourSelection',
    defaultMessage: 'Your selection:',
  },
  selectedEvents: {
    id: 'EventAdminApp.Dashboard.selectedEvents',
    defaultMessage:
      '{count, number} {count, plural, =0 {event} one {event} other {events}}',
  },
  unselect: {
    id: 'EventAdminApp.Dashboard.unselect',
    defaultMessage: 'Unselect',
  },
  previous: {
    id: 'EventAdminApp.Dashboard.previous',
    defaultMessage: 'Previous',
  },
  next: {
    id: 'EventAdminApp.Dashboard.next',
    defaultMessage: 'Next',
  },
  clearFilters: {
    id: 'EventAdminApp.Dashboard.clearFilters',
    defaultMessage: 'Clear filters',
  },
});

function SearchInputBs3({ input, disabled, isLoading }) {
  const intl = useIntl();

  return (
    <div className="input-icon-right">
      <input
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        className="form-control"
        // disabled={disabled}
        {...input}
      />
      <button type="submit" className="btn" disabled={disabled}>
        {isLoading ? (
          <Spinner options={searchSpinner} />
        ) : (
          <i className="fa fa-search" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function Search({ disabled, isLoading }) {
  const [filter] = useState(() => ({ name: 'search' }));

  return (
    <SearchFilter
      name="search"
      filter={filter}
      isLoading={isLoading}
      disabled={disabled}
      inputComponent={SearchInputBs3}
    />
  );
}

function GroupedActions({
  agenda,
  query,
  total,
  selectedEvents,
  extendedAllSelected,
}) {
  const intl = useIntl();

  const usedQuery = extendedAllSelected ? query : { uid: [...selectedEvents] };
  const queryString = qs.stringify(usedQuery, {
    addQueryPrefix: true,
    arrayFormat: 'brackets',
    skipNulls: true,
  });

  const selectedCount = extendedAllSelected ? total : selectedEvents.size;

  return (
    <>
      <ExportsDropdown
        id="grouped-actions-export"
        agenda={agenda}
        queryString={queryString}
        disabled={!selectedCount}
        className="margin-right-sm"
      >
        {intl.formatMessage(exportsMessages.exportSelection)}
      </ExportsDropdown>

      <BatchedStateSelector
        agenda={agenda}
        queryString={queryString}
        placeholder={intl.formatMessage(messages.changeState)}
        isDisabled={!selectedCount}
      />
    </>
  );
}

function Dashboard() {
  const intl = useIntl();
  const apiClient = useApiClient();
  const history = useHistory();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { agenda, agendaSchema, filtersContainerRef } = useLayoutData();

  const res = useSelector((state) => state.res);
  const mapTiles = useSelector((state) => state.settings.mapTiles);
  const assetsPath = useSelector((state) => state.settings.assetsPath);

  const [passTabOpen, setPassTab] = useState(false);

  const parsedLocationSearch = useMemo(
    () =>
      qs.parse(location.search, {
        ignoreQueryPrefix: true,
      }),
    [location.search],
  );

  const flattenedAgendaSchema = useMemo(
    () => flattenAgendaSchema(agendaSchema),
    [agendaSchema],
  );

  const urlQuery = useMemo(() => {
    const { query: q } = removeQueryPrefix(parsedLocationSearch);

    return _.pick(
      q,
      Object.keys(
        validateQuery(q, {
          formSchema: flattenedAgendaSchema,
          emptyValue: 'null',
        }),
      ),
    );
  }, [flattenedAgendaSchema, parsedLocationSearch]);

  const [query, setQuery] = useState(() => urlQuery);

  const hasUrlQuery = useMemo(
    () =>
      Object.keys(urlQuery).length
      && Object.keys(urlQuery).some((key) => key !== 'sort'),
    [urlQuery],
  );

  const hasQuery = useMemo(
    () =>
      Object.keys(query).length
      && Object.keys(query).some((key) => key !== 'sort'),
    [query],
  );

  const [page, setPage] = useState(() =>
    (parsedLocationSearch.page ? parseInt(parsedLocationSearch.page, 10) : 1));

  const [selectedEvents, setSelectedEvents] = useState(() => new Set());
  const [extendedAllSelected, setExtendedAllSelected] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [isShowingAllFilters, setIsShowingAllFilters] = useState(
    !agenda.settings?.admin?.filters?.displayed,
  );

  const redirectURL = useMemo(() => getRedirectURL(location), [location]);

  const collapsedFilters = useFilters(intl, agendaSchema.fields, {
    dateFnsLocale: dateFnsLocales[intl.locale],
    missingValue: 'null',
    mapTiles,
    sort: agenda.settings?.admin?.filters?.displayed ?? [
      'geo',
      'state',
      'relative',
    ],
    include: !isShowingAllFilters
      ? agenda.settings?.admin?.filters?.displayed
      : undefined,
  });

  const filters = useMemo(
    () =>
      collapsedFilters.map((filter) =>
        (['state', 'relative'].includes(filter.name)
          ? { ...filter, defaultCollapsed: false }
          : filter)),
    [collapsedFilters],
  );

  const mapFilter = useMemo(
    () => filters.find((v) => v.name === 'geo'),
    [filters],
  );

  const timingsFilter = useMemo(
    () => filters.find((v) => v.name === 'timings'),
    [filters],
  );

  const removeModal = useModal();

  const onRemove = useCallback(() => {
    const { event } = removeModal.data;

    apiClient
      .delete(`/api/agendas/${agenda.uid}/events/${event.uid}`)
      .json()
      .then(
        () =>
          queryClient
            .refetchQueries(['event-admin-apps', 'events', agenda.slug])
            .catch(() => null),
        (e) => console.log('ERROR', e),
      );

    removeModal.close();
  }, [agenda.slug, apiClient, queryClient, removeModal, agenda.uid]);

  const filtersQuery = useQuery(
    ['event-admin-apps', 'filtersBase', agenda.slug],
    () =>
      getEvents(
        null,
        res.search,
        agenda,
        filters,
        { size: 0, state: null },
        null,
        true,
        20,
        'post',
      ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    },
  );

  const eventsQuery = useQuery(
    ['event-admin-apps', 'events', agenda.slug, { query, page }],
    () =>
      getEvents(
        null,
        res.search,
        agenda,
        filters,
        {
          sort: 'updatedAt.desc',
          state: null,
          ...query,
          detailed: true,
          if: [
            'uid',
            'slug',
            'title',
            'featured',
            'location.name',
            'location.uid',
            'timings',
            'dateRange',
            'status',
            'state',
            'attendanceMode',
            'addMethod',
            'member.name',
            'member.role',
            'member.uid',
            'member.organization',
            'sourceAgendas.title',
            'sourceAgendas.slug',
            'originAgenda.uid',
            'originAgenda.title',
            'onlineAccessLink',
            'registration',
            'motive',
            'valid',
          ],
        },
        page,
        false,
        20,
        'post',
      ),
    {
      // staleTime: 10000,
      notifyOnChangeProps: ['data', 'isLoading', 'isFetching', 'error'],
      keepPreviousData: true, // because query and page change
      onSuccess: (newData) => {
        // Cancel selection
        setSelectedEvents(new Set());
        setExtendedAllSelected(false);

        const { query: q, rest: queryRest } = removeQueryPrefix(parsedLocationSearch);

        // Reset pagination if query has changed
        const queryChanged = !_.isEqual(query, q);

        if (queryChanged && page === parseInt(queryRest.page, 10)) {
          setPage(1);
        }

        // Update location
        if (queryChanged || page !== parseInt(queryRest.page, 10)) {
          const search = qs.stringify(
            {
              ...queryRest,
              page: queryChanged || page === 1 ? null : page,
              ...addQueryPrefix(query),
            },
            {
              addQueryPrefix: true,
              arrayFormat: 'brackets',
              skipNulls: true,
            },
          );

          history.push({ search });
        }

        // Update map markers
        const mapElem = mapFilter?.elemRef.current;

        if (mapElem) {
          mapElem.onQueryChange(newData.aggregations.viewport);
        }

        const timingsElem = timingsFilter?.elemRef?.current;

        if (timingsElem) {
          timingsElem.onQueryChange();
        }
      },
    },
  );

  const { data, isLoading, isFetching, error } = eventsQuery;

  const getOptions = useGetFilterOptions(
    intl,
    filtersQuery.data?.aggregations,
    data?.aggregations,
  );

  const onFilterChange = useCallback((values) => setQuery(values), [setQuery]);

  // Selection
  const isSelectedEvent = useCallback(
    (uid) => selectedEvents.has(uid),
    [selectedEvents],
  );
  const selectEvent = useCallback((uid) => {
    setSelectedEvents((old) => {
      const result = new Set(old);

      if (result.has(uid)) {
        result.delete(uid);
      } else {
        result.add(uid);
      }

      return result;
    });
  }, []);

  const allSelected = useMemo(() => {
    if (!data?.events?.length) {
      return false;
    }

    return selectedEvents.size === data.events.length;
  }, [data, selectedEvents.size]);

  const selectAll = useCallback(() => {
    setSelectedEvents((old) => {
      const result = new Set(old);

      for (const event of data.events) {
        if (allSelected) {
          result.delete(event.uid);
        } else {
          result.add(event.uid);
        }
      }

      return result;
    });
  }, [allSelected, data]);

  const selectExtendedAll = useCallback(
    () =>
      setExtendedAllSelected((old) => {
        if (old) {
          // Cancel selection
          setSelectedEvents(new Set());
        }

        return !old;
      }),
    [],
  );

  const enableSelectMode = useCallback(() => setSelectMode(true), []);
  const disableSelectMode = useCallback(() => {
    setSelectMode(false);
    // Cancel selection
    setSelectedEvents(new Set());
    setExtendedAllSelected(false);
  }, []);

  const hasSelection = useMemo(
    () => selectedEvents.size || extendedAllSelected,
    [extendedAllSelected, selectedEvents.size],
  );

  const previousPage = useMemo(
    () =>
      a11yButtonActionHandler((e) => {
        if (e) {
          e.preventDefault();
        }

        setPage((old) => Math.max(old - 1, 1));
      }),
    [],
  );
  const nextPage = useMemo(
    () =>
      a11yButtonActionHandler((e) => {
        if (e) {
          e.preventDefault();
        }

        setPage((old) => old + 1);
      }),
    [],
  );

  const selectAllRef = useRef();

  useLayoutEffect(() => {
    if (!selectAllRef.current) {
      return;
    }
    selectAllRef.current.indeterminate = selectedEvents.size && !allSelected;
  }, [allSelected, selectedEvents.size]);

  // for FiltersProvider
  const filtersFormRef = useRef();
  const [initialValues] = useState(() => query);
  const validate = useCallback(
    (values) => {
      try {
        validateQuery(values, {
          formSchema: flattenedAgendaSchema,
          emptyValue: 'null',
        });
      } catch (e) {
        console.log('Filters validation error:', e);
      }
    },
    [flattenedAgendaSchema],
  );
  const latestQuery = useLatest(query);

  const clearFilters = useCallback(() => {
    filtersFormRef.current.reset({});
    filtersFormRef.current.submit();
  }, []);

  // Update query when location change
  useUpdateEffect(() => {
    const { query: q } = removeQueryPrefix(parsedLocationSearch);
    const cleanQuery = _.pick(
      q,
      Object.keys(
        validateQuery(q, {
          formSchema: flattenedAgendaSchema,
          emptyValue: 'null',
        }),
      ),
    );

    if ('featured' in cleanQuery) {
      cleanQuery.featured = [].concat(cleanQuery.featured);
    }

    if (!_.isEqual(cleanQuery, latestQuery.current)) {
      const form = filtersFormRef.current;

      form.initialize(cleanQuery);
      form.submit();
    }
  }, [
    agenda,
    flattenedAgendaSchema,
    filters,
    latestQuery,
    parsedLocationSearch,
  ]);

  if (isLoading || filtersQuery.isLoading) {
    return (
      <div className="padding-v-md" style={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  if (filtersQuery.error) {
    throw filtersQuery.error;
  }

  if (error) {
    throw error;
  }

  if (!filtersQuery.data.total) {
    return <EmptyDashboard agenda={agenda} />;
  }

  return (
    <FiltersProvider
      onSubmit={onFilterChange}
      initialValues={initialValues}
      validate={validate}
      intl={intl}
      ref={filtersFormRef}
      filters={filters}
      searchMethod="post"
      dateFnsLocale={dateFnsLocales[intl.locale]}
    >
      <header>
        <Actions
          agenda={agenda}
          query={query}
          selectMode={hasSelection || selectMode}
          toggleSelectMode={enableSelectMode}
        />

        <div className="pull-left" style={{ width: '50%' }}>
          <Search disabled={isFetching} isLoading={isFetching} />
        </div>

        <div className="pull-right">
          {intl.formatMessage(messages.sortedBy)}
          &nbsp;
          <Sort options={sortOptions} />
        </div>

        <div className="clearfix" />

        {hasQuery ? (
          <div className="margin-top-sm" style={{ lineHeight: '24px' }}>
            <span className="hidden-sm">
              <FiltersPreview
                filters={filters}
                getOptions={getOptions}
                disabled={isFetching || filtersQuery.isFetching}
              />
            </span>
            <button
              type="button"
              className="btn btn-hover-danger btn-link btn-link-inline"
              style={{
                lineHeight: '16px',
              }}
              onClick={clearFilters}
            >
              {intl.formatMessage(messages.clearFilters)}
            </button>
          </div>
        ) : null}

        {hasSelection || selectMode ? (
          <div
            className="margin-v-md"
            style={{
              borderLeft: '3px solid #41acdd',
              padding: '5px 5px 5px 12px',
            }}
          >
            <span className="margin-right-sm">
              <b>{intl.formatMessage(messages.yourSelection)}</b>
              &nbsp;
              {intl.formatMessage(messages.selectedEvents, {
                count: extendedAllSelected ? data.total : selectedEvents.size,
              })}
            </span>

            <button
              className="btn btn-link btn-link-inline text-danger"
              type="button"
              onClick={disableSelectMode}
            >
              {intl.formatMessage(messages.unselect)}
            </button>

            <div className="margin-top-xs">
              <GroupedActions
                agenda={agenda}
                query={query}
                total={data.total}
                selectedEvents={selectedEvents}
                extendedAllSelected={extendedAllSelected}
              />
            </div>
          </div>
        ) : null}

        {allSelected && selectedEvents.size < data.total ? (
          <div className="announcement bg-warning margin-bottom-md">
            <div className="container-fluid text-warning">
              <div className="row padding-top-sm padding-right-sm padding-left-md">
                {!extendedAllSelected ? (
                  <p className="text-center">
                    {intl.formatMessage(messages.allSelected, {
                      size: selectedEvents.size,
                      b: (chunks) => <b>{chunks}</b>,
                    })}{' '}
                    <button
                      type="button"
                      className="btn btn-link btn-link-inline"
                      onClick={selectExtendedAll}
                    >
                      {intl.formatMessage(messages.selectExtendedAll, {
                        total: data.total,
                        b: (chunks) => <b>{chunks}</b>,
                      })}
                    </button>
                  </p>
                ) : (
                  <p className="text-center">
                    {intl.formatMessage(messages.extendedAllSelected, {
                      total: data.total,
                      b: (chunks) => <b>{chunks}</b>,
                    })}{' '}
                    <button
                      type="button"
                      className="btn btn-link btn-link-inline"
                      onClick={selectExtendedAll}
                    >
                      {intl.formatMessage(messages.cancelSelection)}
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="margin-top-sm margin-bottom-md">
          <div className="pull-right">
            {data.total > PAGE_SIZE ? (
              <Pager
                page={page}
                pageSize={PAGE_SIZE}
                total={data.total}
                rangeSize={data.events.length}
                previousPage={previousPage}
                nextPage={nextPage}
                className="margin-all-z"
              />
            ) : null}
          </div>

          <div className="padding-top-xs">
            <span className="margin-right-md">
              {hasUrlQuery && hasQuery
                ? intl.formatMessage(messages.totalWithFilters, {
                  selection: data.total,
                  total: filtersQuery.data.total,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })
                : intl.formatMessage(messages.totalEvents, {
                  total: filtersQuery.data.total,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
            </span>

            <label
              className="checkbox-inline"
              htmlFor="select-all"
              style={{ fontWeight: 'normal' }}
            >
              <input
                type="checkbox"
                id="select-all"
                onChange={selectAll}
                checked={allSelected}
                ref={selectAllRef}
                style={{ marginTop: '2px' }}
              />{' '}
              {intl.formatMessage(messages.selectAll)}
            </label>
          </div>
        </div>
      </header>

      <ul className="list-unstyled">
        {data.events.map((event, index) => (
          <EventItem
            key={event.uid}
            agenda={agenda}
            event={event}
            openRemoveModal={() => removeModal.open({ event })}
            selected={isSelectedEvent(event.uid)}
            selectEvent={selectEvent}
            selectionMode={selectMode || !!selectedEvents.size}
            query={query}
            page={page}
            index={index}
            redirectURL={redirectURL}
            isFirst={(page - 1) * PAGE_SIZE + index === 0}
            isLast={(page - 1) * PAGE_SIZE + index === data.total - 1}
            passRes={res.passCulture}
            passTabIsOpen={passTabOpen === event.uid}
            setPassTab={(e) => setPassTab(e)}
            assetsPath={assetsPath}
          />
        ))}
      </ul>

      {data.total > PAGE_SIZE ? (
        <div className="margin-top-md">
          <Pager
            page={page}
            pageSize={PAGE_SIZE}
            total={data.total}
            rangeSize={data.events.length}
            previousPage={previousPage}
            nextPage={nextPage}
          />
        </div>
      ) : null}

      {removeModal.isOpen ? (
        <RemoveModal
          agenda={agenda}
          event={removeModal.data.event}
          onRemove={onRemove}
          onClose={removeModal.close}
        />
      ) : null}

      <FiltersPortal
        filtersContainerRef={filtersContainerRef}
        agenda={agenda}
        filters={filters}
        query={query}
        filtersQuery={filtersQuery}
        eventsQuery={eventsQuery}
        isShowingAllFilters={isShowingAllFilters}
        onShowAllFilters={() => setIsShowingAllFilters(true)}
      />
    </FiltersProvider>
  );
}

export default Dashboard;
