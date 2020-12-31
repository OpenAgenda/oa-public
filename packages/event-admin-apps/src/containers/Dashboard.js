import _ from 'lodash';
import qs from 'qs';
import React, { useCallback, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { useHistory } from 'react-router';
import { useInfiniteQuery, useQuery } from 'react-query';
import { defineMessages, useIntl } from 'react-intl';
import { useUIDSeed } from 'react-uid';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { css } from '@emotion/react';
import { Spinner } from '@openagenda/react-components';
import { useApiClient, ReactSelectInput } from '@openagenda/react-shared';
import validateQuery from '@openagenda/event-search/utils/validateQuery';
import FiltersPart from '../components/FiltersPart';
import getEvents from '../api/getEvents';
import useFilters from '../hooks/useFilters';
import getLocaleValue from '../utils/getLocaleValue';
import stateMessages from '../messages/states';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectInput;

const messages = defineMessages({
  totalEvents: {
    id: 'EventAdminApp.Dashboard.totalEvents',
    defaultMessage: 'Total events: {value}',
  },
  createdBy: {
    id: 'EventAdminApp.Dashboard.createdBy',
    defaultMessage: 'Created by {value}',
  },
  aggregatedFrom: {
    id: 'EventAdminApp.Dashboard.aggregatedFrom',
    defaultMessage: 'Aggregated from {value}',
  },
  filters: {
    id: 'EventAdminApp.Dashboard.filters',
    defaultMessage: 'Filters',
  },
});

const stateBadgeCss = css`
  height: 19px;
  width: 19px;
`;

const stateSelectStyles = {
  ...defaultReactSelectStyles,
  container: provided => ({
    ...provided,
    display: 'inline-block',
  }),
  control: (provided, state) => ({
    ...defaultReactSelectStyles.control(provided, state),
    transition: 'none',
    border: 'none',
    boxShadow: 'none',
    cursor: 'pointer',
    minWidth: 0,
    minHeight: 0,
  }),
  valueContainer: (provided, state) => ({
    ...defaultReactSelectStyles.valueContainer(provided, state),
    padding: 0,
  }),
  singleValue: provided => ({
    ...provided,
    top: 0,
    transform: 'none',
    position: 'relative',
    overflow: 'visible',
    marginRight: 0,
  }),
  option: provided => ({
    ...provided,
    display: 'flex',
  }),
  dropdownIndicator: provided => ({
    ...provided,
    padding: 0,
    verticalAlign: 'middle',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (provided, state) => ({
    ...defaultReactSelectStyles.menu(provided, state),
    minWidth: '150px',
  }),
};

function StateSelector({ event }) {
  const intl = useIntl();

  const stateOptions = useMemo(
    () => [
      {
        label: (
          <>
            <span
              className="badge badge-danger margin-right-xs"
              css={stateBadgeCss}
            >
              &nbsp;
            </span>
            {intl.formatMessage(stateMessages.refused)}
          </>
        ),
        value: -1,
      },
      {
        label: (
          <>
            <span
              className="badge badge-warning margin-right-xs"
              css={stateBadgeCss}
            >
              &nbsp;
            </span>
            {intl.formatMessage(stateMessages.tocontrol)}
          </>
        ),
        value: 0,
      },
      {
        label: (
          <>
            <span
              className="badge badge-default margin-right-xs"
              css={stateBadgeCss}
            >
              &nbsp;
            </span>
            {intl.formatMessage(stateMessages.controlled)}
          </>
        ),
        value: 1,
      },
      {
        label: (
          <>
            <span
              className="badge badge-success margin-right-xs"
              css={stateBadgeCss}
            >
              &nbsp;
            </span>
            {intl.formatMessage(stateMessages.published)}
          </>
        ),
        value: 2,
      },
    ],
    [intl]
  );
  const [value, setValue] = useState(() => stateOptions.find(o => o.value === event.state));

  return (
    <ReactSelectInput
      options={stateOptions}
      value={value}
      onChange={setValue}
      styles={stateSelectStyles}
      isSearchable={false}
      isClearable={false}
    />
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

  const standardsFilters = useFilters(agendaSchema, { standards: true });
  const additionalsFilters = useFilters(agendaSchema, { additionals: true });

  const filtersQuery = useQuery(
    'filters-base',
    () => getEvents(
      apiClient,
      res.jsonExport,
      agenda,
      [...standardsFilters, ...additionalsFilters],
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
      [...standardsFilters, ...additionalsFilters],
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
    <>
      <header>
        <span>
          {intl.formatMessage(messages.totalEvents, {
            value: <strong>{intl.formatNumber(data.pages[0].total)}</strong>,
          })}
        </span>
      </header>

      <ul className="list-unstyled">
        {data.pages.map(page => (
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
                      value: <a href="#_">{event.member.name}</a>,
                    })}
                  </div>
                ) : null}

                {event.sourceAgendas?.length ? (
                  <div className="margin-top-xs">
                    {intl.formatMessage(messages.aggregatedFrom, {
                      value: <a href="#_">{event.sourceAgendas[0].title}</a>,
                    })}
                  </div>
                ) : null}

                <div className="margin-top-xs">
                  <ul className="list-inline">
                    <li>
                      <StateSelector event={event} />
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
            containerRef={filtersContainerRef}
            agenda={agenda}
            agendaSchema={agendaSchema}
            standardsFilters={standardsFilters}
            additionalsFilters={additionalsFilters}
            onFilterChange={onFilterChange}
            query={query}
          />
        </div>,
        filtersContainerRef.current
      )}
    </>
  );
}

export default hot(Dashboard);
