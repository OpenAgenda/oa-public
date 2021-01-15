import _ from 'lodash';
import qs from 'qs';
import React, {
  useCallback, useMemo, useState, useRef
} from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { useHistory } from 'react-router';
import { useInfiniteQuery, useQuery } from 'react-query';
import { defineMessages, useIntl } from 'react-intl';
import { useLatest, useUpdateEffect } from 'react-use';
import { useUIDSeed } from 'react-uid';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { Field, useForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useDebouncedCallback } from 'use-debounce';
import { css } from '@emotion/react';
import { Spinner } from '@openagenda/react-components';
import { useApiClient } from '@openagenda/react-shared';
import { FiltersProvider } from '@openagenda/react-filters';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import FiltersPart from '../components/FiltersPart';
import FiltersPreview from '../components/FiltersPreview';
import StateSelector from '../components/StateSelector';
import getEvents from '../api/getEvents';
import useFilters from '../hooks/useFilters';
import getLocaleValue from '../utils/getLocaleValue';

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
  createdBy: {
    id: 'EventAdminApp.Dashboard.createdBy',
    defaultMessage: 'Created by <link>{name}</link>',
  },
  aggregatedFrom: {
    id: 'EventAdminApp.Dashboard.aggregatedFrom',
    defaultMessage: 'Aggregated from <link>{title}</link>',
  },
  filters: {
    id: 'EventAdminApp.Dashboard.filters',
    defaultMessage: 'Filters',
  },
  searchPlaceholder: {
    id: 'EventAdminApp.Dashboard.searchPlaceholders',
    defaultMessage: 'Search',
  },
});

function SearchField({
  input,
  // meta
}) {
  const intl = useIntl();

  return (
    <div
      className="form-group"
      css={css`
        width: 50%;
      `}
    >
      <div className="input-icon-right">
        <input
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          className="form-control"
          {...input}
        />
        <button type="submit" className="btn">
          <i className="fa fa-search" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function SearchFilter() {
  const form = useForm();
  const { callback: onChange } = useDebouncedCallback(() => form.submit(), 400);

  return (
    <>
      <Field component={SearchField} name="search" type="text" />

      <OnChange name="search">{onChange}</OnChange>
    </>
  );
}

function Dashboard({ agenda, agendaSchema, filtersContainerRef }) {
  const intl = useIntl();
  const apiClient = useApiClient();
  const history = useHistory();

  const res = useSelector(state => state.res);

  const [query, setQuery] = useState(() => {
    const baseQuery = qs.parse(history.location.search, {
      ignoreQueryPrefix: true,
    });

    return _.pick(
      validateQuery(baseQuery, agendaSchema),
      Object.keys(baseQuery)
    );
  });

  const hasQuery = useMemo(() => !!Object.keys(query).length, [query]);

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

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ['events', query],
    ({ pageParam }) => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      [...standardsFilters, ...additionalsFilters].filter(
        filter => filter.type !== 'dateRange'
      ),
      {
        ...query,
        sort: 'updatedAt.desc',
        detailed: true,
      },
      pageParam
    ),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'isLoading', 'error', 'isFetchingNextPage'],
      keepPreviousData: true, // because query change,
      onSuccess: () => {
        const search = qs.stringify(query, {
          addQueryPrefix: true,
          arrayFormat: 'brackets',
        });

        if (history.location.search !== search) {
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

  return (
    <FiltersProvider
      onSubmit={onFilterChange}
      initialValues={initialQuery}
      validate={validate}
      intl={intl}
      ref={filtersFormRef}
    >
      <header
        css={css`
          line-height: 26px;
        `}
      >
        <SearchFilter />

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
      </header>

      <ul className="list-unstyled">
        {data.pages.map((page, pageIndex) => (
          <React.Fragment key={seed(page)}>
            {page.events.map(event => (
              <li key={event.uid} className="margin-top-md">
                <div>
                  <b>{getLocaleValue(event.title, intl.locale)}</b>
                </div>

                <div className="margin-top-xs">
                  {event.location.name},{' '}
                  {getLocaleValue(event.dateRange, intl.locale)}
                </div>

                {event.member ? (
                  <div className="margin-top-xs">
                    {intl.formatMessage(messages.createdBy, {
                      name: event.member.name,
                      link: chunks => <a href="#_">{chunks}</a>,
                    })}
                  </div>
                ) : null}

                {event.sourceAgendas?.length ? (
                  <div className="margin-top-xs">
                    {intl.formatMessage(messages.aggregatedFrom, {
                      title: event.sourceAgendas[0].title,
                      link: chunks => <a href="#_">{chunks}</a>,
                    })}
                  </div>
                ) : null}

                <div className="margin-top-xs">
                  <ul className="list-inline">
                    <li>
                      <StateSelector
                        agenda={agenda}
                        event={event}
                        pageIndex={pageIndex}
                      />
                    </li>
                    <li>
                      <a className="btn btn-link btn-link-inline" href="#_">
                        Editer
                      </a>
                    </li>
                    <li>
                      <a className="btn btn-link btn-link-inline" href="#_">
                        Contacter
                      </a>
                    </li>
                    <li>
                      <a className="btn btn-link btn-link-inline" href="#_">
                        Voir le lieu
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>

      <Waypoint onEnter={fetchNextPage} />

      {isFetchingNextPage ? (
        <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner />
        </div>
      ) : null}

      {ReactDOM.createPortal(
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
        filtersContainerRef.current
      )}
    </FiltersProvider>
  );
}

export default hot(Dashboard);
