import _ from 'lodash';
import React, { useMemo, useState, useCallback } from 'react';
import { provideHooks } from 'redial';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Field } from 'react-final-form';
import ReactMarkdown from 'react-markdown';
import qs from 'qs';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import Spinner from '@openagenda/react-components/build/Spinner';
import * as agendaActions from '../reducers/agenda';
import * as modalsActions from '../reducers/modals';
import * as sourcesActions from '../reducers/sources';
import SearchInput from '../components/SearchInput';
import SourcesList from './SourcesList';
import AddSourceModal from './AddSourceModal';
import UpdateSourceModal from './UpdateSourceModal';
import RemoveSourceModal from './RemoveSourceModal';

const messages = defineMessages({
  aggregatorExplanation: {
    id: 'aggregator-sources.Dashboard.aggregatorExplanation',
    defaultMessage:
      'This feature allows you to automatically fetch the events added to the agendas of your choice.'
  },
  createAggregator: {
    id: 'aggregator-sources.Dashboard.createAggregator',
    defaultMessage: 'Activate agenda aggregation'
  },
  sourcesHelp: {
    id: 'aggregator-sources.Dashboard.sourcesHelp',
    defaultMessage: 'Click here to find out more about aggregations'
  },
  sourceAgendas: {
    id: 'aggregator-sources.Dashboard.sourceAgendas',
    defaultMessage: 'Source agendas'
  },
  sourcesExplanation: {
    id: 'aggregator-sources.Dashboard.sourcesExplanation',
    defaultMessage:
      'The events published by the agendas listed here are automatically added to the [{title}]({link}) agenda.'
  },
  addSources: {
    id: 'aggregator-sources.Dashboard.addSources',
    defaultMessage:
      'To aggregate new agendas, [go to the page of the agenda](%searchLink%) you wish to add and click on Export > Aggregate in > **{agenda}**'
  },
  searchAgenda: {
    id: 'aggregator-sources.Dashboard.searchAgenda',
    defaultMessage: 'Search an agenda'
  },
  numberOfResults: {
    id: 'aggregator-sources.Dashboard.numberOfResults',
    defaultMessage: 'Number of results'
  },
  noResult: {
    id: 'aggregator-sources.Dashboard.noResult',
    defaultMessage: 'No result found'
  },
  addASource: {
    id: 'aggregator-sources.Dashboard.addASource',
    defaultMessage: 'Add a source'
  }
});

function Dashboard({ agenda, history }) {
  const query = useMemo(
    () => qs.parse(history.location.search, { ignoreQueryPrefix: true }),
    [history.location.search]
  );
  const [value, setValue] = useState(
    query.search !== '' ? query.search : undefined
  );
  const [previousValue, setPreviousValue] = useState();

  const intl = useIntl();
  const dispatch = useDispatch();

  const res = useSelector(state => state.res);
  const loading = useSelector(state => _.get(state, 'sources.loading', true));
  const listLoading = useSelector(state => state.sources.listLoading);
  const agendaSources = useSelector(state => state.sources.data);
  const nextLoading = useSelector(state => state.sources.nextLoading);
  const modals = useSelector(state => state.modals);

  const createAggregator = useCallback(
    () => dispatch(agendaActions.createAggregator(agenda.uid)),
    [dispatch, agenda.uid]
  );

  const search = useCallback(
    v => dispatch(sourcesActions.list({ search: v })).finally(() => {
      history.push({
        ...history.location,
        search: qs.stringify({ ...query, search: v || undefined })
      });
    }),
    [dispatch, history, query]
  );

  const showModalAddSource = useCallback(
    () => dispatch(modalsActions.showModal('addSource')),
    [dispatch]
  );
  const closeModalAddSource = useCallback(
    () => dispatch(modalsActions.closeModal('addSource')),
    [dispatch]
  );
  const closeModalUpdateSource = useCallback(
    () => dispatch(modalsActions.closeModal('addSource')),
    [dispatch]
  );
  const closeModalRemoveSource = useCallback(
    () => dispatch(modalsActions.closeModal('addSource')),
    [dispatch]
  );

  const debouncedSearch = useMemo(() => _.debounce(search, 400), [search]);

  const onSearch = useCallback(
    values => {
      setPreviousValue(value);
      setValue(values.search);

      return debouncedSearch(values.search);
    },
    [value, debouncedSearch]
  );

  if (loading) {
    return (
      <div className="padding-v-md" style={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  if (!agenda.credentials.aggregator) {
    return (
      <div className="margin-top-sm text-center">
        <p>{intl.formatMessage(messages.aggregatorExplanation)}</p>
        <div className="margin-v-lg">
          <button
            className="btn btn-primary"
            type="button"
            onClick={createAggregator}
          >
            {intl.formatMessage(messages.createAggregator)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="pull-right">
          <MoreInfo
            id="source-help"
            content={intl.formatMessage(messages.sourcesHelp)}
            link="https://openagenda.zendesk.com/hc/fr/articles/203549842-Agr%C3%A9ger-des-agendas"
            placement="left"
          />
        </div>
        <h2>{intl.formatMessage(messages.sourceAgendas)}</h2>
        <div className="margin-v-md">
          <ReactMarkdown
            className="text-muted"
            source={`${intl.formatMessage(messages.sourcesExplanation, {
              title: agenda.title,
              link: res.show.replace(':slug', agenda.slug)
            })} ${intl.formatMessage(messages.addSources, {
              searchLink: res.search,
              agenda: agenda.title
            })}`}
          />
        </div>
        <Form
          initialValues={{ search: query.search || '' }}
          onSubmit={onSearch}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field
                component={SearchInput}
                name="search"
                type="text"
                classNameGroup="search margin-v-md"
                className="form-control"
                placeholder={intl.formatMessage(messages.searchAgenda)}
                action={v => debouncedSearch(v === '' ? undefined : v)}
                loading={listLoading}
                intl={intl}
                visible={
                  (value && value !== '')
                  || (previousValue && previousValue !== '')
                  || (!previousValue && !value)
                }
              />
            </form>
          )}
        </Form>
      </div>

      <div>
        <p>
          {intl.formatMessage(messages.numberOfResults)}: {agendaSources.length}{' '}
          -{' '}
          <button
            type="button"
            className="btn btn-link-inline"
            onClick={showModalAddSource}
          >
            {intl.formatMessage(messages.addASource)}
          </button>
        </p>

        <SourcesList sources={agendaSources} />

        {!agendaSources || !agendaSources.length ? (
          <div className="text-center text-muted margin-v-md">
            {intl.formatMessage(messages.noResult)}
          </div>
        ) : null}

        {nextLoading && (
          <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner />
          </div>
        )}
      </div>

      {modals.addSource && modals.addSource.visible ? (
        <AddSourceModal onClose={closeModalAddSource} />
      ) : null}
      {modals.updateSource && modals.updateSource.visible ? (
        <UpdateSourceModal onClose={closeModalUpdateSource} />
      ) : null}
      {modals.removeSource && modals.removeSource.visible ? (
        <RemoveSourceModal onClose={closeModalRemoveSource} />
      ) : null}
    </div>
  );
}

export default provideHooks({
  defer: async ({ store: { dispatch }, location, params }) => {
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const promises = [];

    // promises.push(dispatch(agendaActions.load(params.slug)));

    // if (!sourcesActions.isLoaded(state)) {
    promises.push(dispatch(sourcesActions.load(params.slug, query)));
    // }

    return Promise.all(promises);
  }
})(Dashboard);
