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
import { useQuery, useQueryClient } from 'react-query';
import { defineMessages, useIntl } from 'react-intl';
import { useLatest, useUpdateEffect } from 'react-use';
import { useSelector } from 'react-redux';
import { Field, useForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useDebouncedCallback } from 'use-debounce';
import { css } from '@emotion/react';
import { Spinner } from '@openagenda/react-components';
import {
  a11yButtonActionHandler,
  useApiClient,
  useConstant,
  useModal,
} from '@openagenda/react-shared';
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
import Pager from '../components/Pager';
import removeQueryPrefix from '../utils/removeQueryPrefix';
import addQueryPrefix from '../utils/addQueryPrefix';

const PAGE_SIZE = 20;

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
      '<strong>{selection, number}</strong> / <strong>{total, number}</strong> {total, plural, =0 {event} one {event} other {events}}',
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

function SearchField({ input, disabled, isLoading }) {
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
  page,
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
        page={page}
      />
    </div>,
    filtersContainer
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
      <span className="dropdown margin-right-md">
        <button
          className="btn btn-link btn-link-inline dropdown-toggle"
          type="button"
          id="grouped-actions-export"
          data-toggle="dropdown"
          disabled={!selectedCount}
        >
          {intl.formatMessage(exportsMessages.exportSelection)}
          &nbsp;
          <i className="fa fa-lg fa-angle-down" />
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
      </span>

      <BatchedStateSelector
        agenda={agenda}
        queryString={queryString}
        placeholder={intl.formatMessage(messages.changeState)}
        isDisabled={!selectedCount}
      />
    </>
  );
}

function Dashboard({ agenda, agendaSchema, filtersContainerRef }) {
  const intl = useIntl();
  const apiClient = useApiClient();
  const history = useHistory();
  const queryClient = useQueryClient();

  const res = useSelector(state => state.res);

  const parsedLocationSearch = useMemo(
    () => qs.parse(history.location.search, {
      ignoreQueryPrefix: true,
    }),
    [history.location.search]
  );

  const [query, setQuery] = useState(() => {
    const baseQuery = removeQueryPrefix(parsedLocationSearch);

    return _.pick(
      validateQuery(baseQuery, agendaSchema),
      Object.keys(baseQuery)
    );
  });

  const hasQuery = useMemo(() => !!Object.keys(query).length, [query]);

  const [page, setPage] = useState(() => (parsedLocationSearch.page ? parseInt(parsedLocationSearch.page, 10) : 1));

  const [selectedEvents, setSelectedEvents] = useState(() => new Set());
  const [extendedAllSelected, setExtendedAllSelected] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

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
    data, isLoading, isFetching, error
  } = useQuery(
    ['event-admin-apps', 'events', { query, page }],
    () => getEvents(
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
      page
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'isFetching', 'error'],
      keepPreviousData: true, // because query and page change
      onSuccess: () => {
        // Cancel selection
        setSelectedEvents(new Set());
        setExtendedAllSelected(false);

        const baseQuery = removeQueryPrefix(parsedLocationSearch);
        const queryRest = Object.keys(parsedLocationSearch).reduce(
          (accu, key) => (key.startsWith('q.')
            ? accu
            : { ...accu, [key]: parsedLocationSearch[key] }),
          {}
        );

        if (!_.isEqual(query, baseQuery) || page !== queryRest.page) {
          const search = qs.stringify(
            {
              ...queryRest,
              page: page > 1 ? page : null,
              ...addQueryPrefix(query),
            },
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

  const allSelected = useMemo(() => {
    if (!data?.events) {
      return false;
    }

    return selectedEvents.size === data.events.length;
  }, [data, selectedEvents.size]);

  const selectAll = useCallback(() => {
    setSelectedEvents(old => {
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
    () => setExtendedAllSelected(old => {
      if (old) {
        // Cancel selection
        setSelectedEvents(new Set());
      }

      return !old;
    }),
    []
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
    [extendedAllSelected, selectedEvents.size]
  );

  const previousPage = useMemo(
    () => a11yButtonActionHandler(e => {
      if (e) {
        e.preventDefault();
      }

      setPage(old => Math.max(old - 1, 1));
    }),
    []
  );
  const nextPage = useMemo(
    () => a11yButtonActionHandler(e => {
      if (e) {
        e.preventDefault();
      }

      setPage(old => old + 1);
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

  const clearFilters = useCallback(() => filtersFormRef.current.reset({}), []);

  // Update query when location change
  useUpdateEffect(() => {
    const baseQuery = removeQueryPrefix(parsedLocationSearch);
    const cleanQuery = _.pick(
      validateQuery(baseQuery, agendaSchema),
      Object.keys(baseQuery)
    );

    if (!_.isEqual(cleanQuery, latestQuery.current)) {
      filtersFormRef.current.initialize(cleanQuery);
    }
  }, [
    additionalsFilters,
    agenda,
    agendaSchema,
    history.location,
    latestQuery,
    standardsFilters,
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
        <Actions
          agenda={agenda}
          query={query}
          selectMode={hasSelection || selectMode}
          toggleSelectMode={enableSelectMode}
        />

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

        {hasQuery ? (
          <div
            className="hidden-sm margin-top-sm"
            css={css`
              line-height: 24px;

              .badge {
                margin-right: 4px;
              }
            `}
          >
            <FiltersPreview
              agenda={agenda}
              query={query}
              page={page}
              standardsFilters={standardsFilters}
              additionalsFilters={additionalsFilters}
            />
            <button
              type="button"
              className="btn-link btn-link-inline"
              css={css`
                line-height: 16px;
              `}
              onClick={clearFilters}
            >
              {intl.formatMessage(messages.clearFilters)}
            </button>
          </div>
        ) : null}

        {hasSelection || selectMode ? (
          <div
            className="margin-v-md"
            css={css`
              border-left: 3px solid #41acdd;
              padding: 5px 5px 5px 12px;
            `}
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
          <div className={`announcement bg-${kind} margin-bottom-md`}>
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
                        total: data.total,
                        b: chunks => <b>{chunks}</b>,
                      })}
                    </button>
                  </p>
                ) : (
                  <p className="text-center">
                    {intl.formatMessage(messages.extendedAllSelected, {
                      total: data.total,
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
                css={css`
                  margin: 0;
                `}
              />
            ) : null}
          </div>

          <div className="padding-top-xs">
            <span className="margin-right-md">
              {hasQuery
                ? intl.formatMessage(messages.totalWithFilters, {
                  selection: data.total,
                  total: filtersQuery.data.total,
                  strong: chunks => <strong>{chunks}</strong>,
                })
                : intl.formatMessage(messages.totalEvents, {
                  total: filtersQuery.data.total,
                  strong: chunks => <strong>{chunks}</strong>,
                })}
            </span>

            <label
              className="checkbox-inline"
              htmlFor="select-all"
              css={css`
                font-weight: normal;

                // Does not work directly on input
                input {
                  margin-top: 2px;
                }
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
            isFirst={(page - 1) * PAGE_SIZE + index === 0}
            isLast={(page - 1) * PAGE_SIZE + index === data.total - 1}
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
        standardsFilters={standardsFilters}
        additionalsFilters={additionalsFilters}
        query={query}
        page={page}
      />
    </FiltersProvider>
  );
}

export default hot(Dashboard);
