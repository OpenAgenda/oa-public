import _ from 'lodash';
import qs from 'qs';
import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { useHistory } from 'react-router';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import { defineMessages, useIntl } from 'react-intl';
import { useLatest, useUpdateEffect } from 'react-use';
import { useUIDSeed } from 'react-uid';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { Field, useForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useDebouncedCallback } from 'use-debounce';
import cn from 'classnames';
import { css } from '@emotion/react';
import { Spinner } from '@openagenda/react-components';
import { useApiClient, useConstant, useModal } from '@openagenda/react-shared';
import { FiltersProvider } from '@openagenda/react-filters';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import FiltersPart from '../components/FiltersPart';
import FiltersPreview from '../components/FiltersPreview';
import getEvents from '../api/getEvents';
import useFilters from '../hooks/useFilters';
import RemoveModal from '../components/RemoveModal';
import EventItem from '../components/EventItem';
import SortSelector from '../components/SortSelector';
import Actions from '../components/Actions';
import DownloadLink from '../components/DownloadLink';
import exportsMessages from '../messages/exports';
import BatchedStateSelector from '../components/BatchedStateSelector';

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4,
};

const messages = defineMessages({
  totalEvents: {
    id: 'EventAdminApp.Dashboard.totalEvents',
    defaultMessage:
      '<strong>{total, number}</strong> {total, plural, =0 {event} one {event} other {events}}',
  },
  totalWithFilters: {
    id: 'EventAdminApp.Dashboard.totalWithFilters',
    defaultMessage:
      '<strong>{selection, number}</strong> / <strong>{total, number}</strong> {total, plural, =0 {event} one {event} other {events}}{filters}',
  },
  filters: {
    id: 'EventAdminApp.Dashboard.filters',
    defaultMessage: 'Filters',
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
    defaultMessage: 'Change state:',
  },
});

function addQueryPrefix(query, prefix = 'q.') {
  const result = {};

  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      result[`${prefix}${key}`] = query[key];
    }
  }

  return result;
}

function removeQueryPrefix(query, prefix = 'q.') {
  const result = {};

  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      if (key.startsWith(prefix)) {
        result[key.slice(prefix.length)] = query[key];
      }
    }
  }

  return result;
}

function SearchField({ input, disabled, isLoading }) {
  const intl = useIntl();

  return (
    <div className="form-group">
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
    </div>
  );
}

function SearchFilter({ disabled, isLoading }) {
  const form = useForm();

  const { callback: onChange } = useDebouncedCallback(() => form.submit(), 400);

  return (
    <>
      <Field
        component={SearchField}
        name="search"
        type="text"
        isLoading={isLoading}
        disabled={disabled}
      />

      <OnChange name="search">{onChange}</OnChange>
    </>
  );
}

function FiltersPortal({
  filtersContainerRef,
  agenda,
  standardsFilters,
  additionalsFilters,
  query,
}) {
  const intl = useIntl();

  const filtersContainer = useConstant(() => document.createElement('div'));

  useLayoutEffect(() => {
    const filtersContainerElem = filtersContainerRef.current;

    filtersContainerElem.appendChild(filtersContainer);

    return () => filtersContainerElem.removeChild(filtersContainer);
  }, [filtersContainer, filtersContainerRef]);

  return ReactDOM.createPortal(
    <div>
      <div className="margin-bottom-xs">
        <b>{intl.formatMessage(messages.filters)}</b>
      </div>

      <FiltersPart
        agenda={agenda}
        standardsFilters={standardsFilters}
        additionalsFilters={additionalsFilters}
        query={query}
      />
    </div>,
    filtersContainer
  );
}

function GroupedActions({
  agenda,
  query,
  selectedEvents,
  extendedAllSelected,
}) {
  const intl = useIntl();

  const usedQuery = extendedAllSelected ? query : { uid: [...selectedEvents] };
  const queryString = qs.stringify(usedQuery, {
    addQueryPrefix: true,
    skipNulls: true,
  });

  // const selectedCount = extendedAllSelected ? total : selectedEvents.size;

  return (
    <>
      <div className="dropdown">
        <button
          className="btn btn-link btn-link-inline btn-sm dropdown-toggle"
          type="button"
          id="grouped-actions-export"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="true"
        >
          {intl.formatMessage(exportsMessages.exportSelection)}
          &nbsp;
          <span className="caret" />
        </button>
        <ul className="dropdown-menu" aria-labelledby="grouped-actions-export">
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.json${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toJSON)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.csv${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toCSV)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.xlsx${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toXLSX)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.ics${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toICS)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.md${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toMD)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.txt${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toTXT)}
            </DownloadLink>
          </li>
          <li>
            <DownloadLink
              href={`/agendas/${agenda.uid}/admin/events.v2.rss${queryString}`}
            >
              {intl.formatMessage(exportsMessages.toRSS)}
            </DownloadLink>
          </li>
        </ul>
      </div>

      <div>
        {intl.formatMessage(messages.changeState)}{' '}
        <BatchedStateSelector
          agenda={agenda}
          queryString={queryString}
          placeholder={intl.formatMessage(messages.state)}
        />
      </div>
    </>
  );
}

function Dashboard({ agenda, agendaSchema, filtersContainerRef }) {
  const intl = useIntl();
  const apiClient = useApiClient();
  const history = useHistory();
  const queryClient = useQueryClient();

  const res = useSelector(state => state.res);

  const [query, setQuery] = useState(() => {
    const parsedSearch = qs.parse(history.location.search, {
      ignoreQueryPrefix: true,
    });
    const baseQuery = removeQueryPrefix(parsedSearch);

    return _.pick(
      validateQuery(baseQuery, agendaSchema),
      Object.keys(baseQuery)
    );
  });

  const hasQuery = useMemo(() => !!Object.keys(query).length, [query]);

  const standardsFilters = useFilters(agendaSchema, { standards: true });
  const additionalsFilters = useFilters(agendaSchema, { additionals: true });

  const removeModal = useModal();

  const onRemove = useCallback(() => {
    const { event } = removeModal.data;

    apiClient.delete(`/${agenda.slug}/events/${event.slug}`).then(
      () => queryClient
        .refetchQueries(['event-admin-apps', 'events'])
        .catch(() => null),
      e => console.log('ERROR', e)
    );

    removeModal.close();
  }, [agenda.slug, apiClient, queryClient, removeModal]);

  const filtersQuery = useQuery(
    ['event-admin-apps', 'filtersBase'],
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

  const {
    data,
    isLoading,
    isFetching,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ['event-admin-apps', 'events', query],
    ({ pageParam }) => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      [...standardsFilters, ...additionalsFilters].filter(
        filter => filter.type !== 'dateRange'
      ),
      {
        ...query,
        // sort: 'updatedAt.desc',
        detailed: true,
      },
      pageParam
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: [
        'data',
        'isLoading',
        'isFetching',
        'error',
        'isFetchingNextPage',
      ],
      keepPreviousData: true, // because query change,
      onSuccess: () => {
        const parsedSearch = qs.parse(history.location.search, {
          ignoreQueryPrefix: true,
        });
        const baseQuery = removeQueryPrefix(parsedSearch);
        const queryRest = Object.keys(parsedSearch).reduce(
          (accu, key) => (key.startsWith('q.') ? accu : { ...accu, [key]: parsedSearch[key] }),
          {}
        );

        if (!_.isEqual(query, baseQuery)) {
          const search = qs.stringify(
            { ...queryRest, ...addQueryPrefix(query) },
            {
              addQueryPrefix: true,
              arrayFormat: 'brackets',
              skipNulls: true,
            }
          );

          history.push({
            ...history.location,
            search,
          });
        }
      },
      getNextPageParam: lastPage => {
        if (lastPage.sort) {
          return lastPage.sort;
        }
      },
    }
  );

  const onFilterChange = useCallback(values => setQuery(values), []);

  // Selection
  const [selectedEvents, setSelectedEvents] = useState(() => new Set());
  const isSelectedEvent = useCallback(uid => selectedEvents.has(uid), [
    selectedEvents,
  ]);
  const selectEvent = useCallback(uid => {
    setSelectedEvents(old => {
      const result = new Set(old);

      if (result.has(uid)) {
        result.delete(uid);
      } else {
        result.add(uid);
      }

      return result;
    });
  }, []);

  const [extendedAllSelected, setExtendedAllSelected] = useState(false);
  const allSelected = useMemo(() => {
    if (!data?.pages) {
      return false;
    }

    const displayedEvents = data.pages.reduce(
      (result, p) => result + p.events.length,
      0
    );

    return selectedEvents.size === displayedEvents;
  }, [data, selectedEvents.size]);

  const selectAll = useCallback(() => {
    setSelectedEvents(old => {
      const result = new Set(old);

      for (const page of data.pages) {
        for (const event of page.events) {
          if (allSelected) {
            result.delete(event.uid);
          } else {
            result.add(event.uid);
          }
        }
      }

      return result;
    });
  }, [allSelected, data]);
  const selectExtendedAll = useCallback(
    () => setExtendedAllSelected(old => {
      if (old) {
        // Cancel selection
        setSelectedEvents(new Set());
      }

      return !old;
    }),
    []
  );

  const selectAllRef = useRef();

  useLayoutEffect(() => {
    if (!selectAllRef.current) {
      return;
    }
    selectAllRef.current.indeterminate = selectedEvents.size && !allSelected;
  }, [allSelected, selectedEvents.size]);

  // Grouped actions
  const [displayGroupedActions, setDisplayGroupedActions] = useState(false);
  const toggleGroupedActions = useCallback(
    () => setDisplayGroupedActions(prev => !prev),
    []
  );

  useLayoutEffect(() => {
    if (!selectedEvents.size) {
      setDisplayGroupedActions(false);
    }
  }, [selectedEvents.size]);

  // for FiltersProvider
  const filtersFormRef = useRef();
  const [initialQuery] = useState(query);
  const validate = useCallback(
    values => {
      try {
        validateQuery(values, agendaSchema);
      } catch (e) {
        console.log('Filters validation error:', e);
      }
    },
    [agendaSchema]
  );
  const latestQuery = useLatest(query);

  // Update query when location change
  useUpdateEffect(() => {
    const parsedSearch = qs.parse(history.location.search, {
      ignoreQueryPrefix: true,
    });
    const baseQuery = removeQueryPrefix(parsedSearch);

    if (!_.isEqual(baseQuery, latestQuery.current)) {
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
    history.location,
    latestQuery,
    standardsFilters,
  ]);

  const seed = useUIDSeed();

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

  const kind = 'warning';

  return (
    <FiltersProvider
      onSubmit={onFilterChange}
      initialValues={initialQuery}
      validate={validate}
      intl={intl}
      ref={filtersFormRef}
    >
      <header>
        <Actions agenda={agenda} query={query} />

        <div className="clearfix" />

        <div
          className="pull-left"
          css={css`
            width: 50%;
          `}
        >
          <SearchFilter disabled={isFetching} isLoading={isFetching} />
        </div>

        <div className="pull-right">
          {intl.formatMessage(messages.sortedBy)}
          &nbsp;
          <SortSelector onFilterChange={onFilterChange} query={query} />
        </div>

        <div className="clearfix" />

        <div
          css={css`
            line-height: 26px;
          `}
        >
          {hasQuery
            ? intl.formatMessage(messages.totalWithFilters, {
              selection: data.pages[0].total,
              total: filtersQuery.data.total,
              strong: chunks => <strong>{chunks}</strong>,
              filters: (
                <span className="oa-filter-value-preview">
                  <FiltersPreview
                    query={query}
                    agenda={agenda}
                    standardsFilters={standardsFilters}
                    additionalsFilters={additionalsFilters}
                  />
                </span>
              ),
            })
            : intl.formatMessage(messages.totalEvents, {
              total: filtersQuery.data.total,
              strong: chunks => <strong>{chunks}</strong>,
            })}
        </div>

        <div
          css={css`
            line-height: 20px;
          `}
        >
          <div className="checkbox">
            <label
              htmlFor="select-all"
              css={css`
                font-weight: normal;
              `}
            >
              <input
                type="checkbox"
                id="select-all"
                onChange={selectAll}
                checked={allSelected}
                ref={selectAllRef}
              />{' '}
              {intl.formatMessage(messages.selectAll)}
            </label>
          </div>
        </div>

        <div>
          <button
            type="button"
            className={cn('btn btn-link btn-link-inline', {
              dropup: displayGroupedActions,
            })}
            onClick={toggleGroupedActions}
            disabled={!selectedEvents.size}
          >
            {intl.formatMessage(messages.groupedActions)}&nbsp;
            <span className="caret" />
          </button>

          {displayGroupedActions ? (
            <div className="margin-top-xs">
              <GroupedActions
                agenda={agenda}
                query={query}
                total={data.pages[0].total}
                selectedEvents={selectedEvents}
                extendedAllSelected={extendedAllSelected}
              />
            </div>
          ) : null}
        </div>
      </header>

      {allSelected && selectedEvents.size < data.pages[0].total ? (
        <div className={`announcement bg-${kind} margin-top-sm`}>
          <div className={`container-fluid text-${kind}`}>
            <div className="row padding-top-sm padding-right-sm padding-left-md">
              {!extendedAllSelected ? (
                <p className="text-center">
                  {intl.formatMessage(messages.allSelected, {
                    size: selectedEvents.size,
                    b: chunks => <b>{chunks}</b>,
                  })}{' '}
                  <button
                    type="button"
                    className="btn btn-link btn-link-inline"
                    onClick={selectExtendedAll}
                  >
                    {intl.formatMessage(messages.selectExtendedAll, {
                      total: data.pages[0].total,
                      b: chunks => <b>{chunks}</b>,
                    })}
                  </button>
                </p>
              ) : (
                <p className="text-center">
                  {intl.formatMessage(messages.extendedAllSelected, {
                    total: data.pages[0].total,
                    b: chunks => <b>{chunks}</b>,
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

      <ul className="list-unstyled padding-top-sm">
        {data.pages.map((page, pageIndex) => (
          <React.Fragment key={seed(page)}>
            {page.events.map(event => (
              <EventItem
                key={event.uid}
                agenda={agenda}
                event={event}
                pageIndex={pageIndex}
                openRemoveModal={() => removeModal.open({ event })}
                selected={isSelectedEvent(event.uid)}
                selectEvent={selectEvent}
                selectionMode={!!selectedEvents.size}
              />
            ))}

            {removeModal.isOpen ? (
              <RemoveModal
                agenda={agenda}
                event={removeModal.data.event}
                onRemove={onRemove}
                onClose={removeModal.close}
              />
            ) : null}
          </React.Fragment>
        ))}
      </ul>

      <Waypoint onEnter={fetchNextPage} />

      {isFetchingNextPage ? (
        <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner />
        </div>
      ) : null}

      <FiltersPortal
        filtersContainerRef={filtersContainerRef}
        agenda={agenda}
        standardsFilters={standardsFilters}
        additionalsFilters={additionalsFilters}
        query={query}
      />
    </FiltersProvider>
  );
}

export default hot(Dashboard);
