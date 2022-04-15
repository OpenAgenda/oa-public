import _ from 'lodash';
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Field } from 'react-final-form';
import ReactMarkdown from 'react-markdown';
import qs from 'qs';
import Fuse from 'fuse.js';
import { css } from '@emotion/react';
import { useApiClient, useLayoutData, Spinner } from '@openagenda/react-shared';
import * as modalsActions from '../reducers/modals';
import * as sourcesActions from '../reducers/sources';
import SearchInput from '../components/SearchInput';
import SourcesList from '../components/SourcesList';
import AddSourceModal from '../components/AddSourceModal';
import UpdateSourceModal from '../components/UpdateSourceModal';
import RemoveSourceModal from '../components/RemoveSourceModal';
import AggregatorRulesModal from '../components/AggregatorRulesModal';
import AggregatorRules from '../components/AggregatorRules';
import Presentation from '../components/Presentation';

const fuseOptions = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['agenda.title'],
};

const messages = defineMessages({
  aggregatorExplanation: {
    id: 'aggregator-sources.Dashboard.aggregatorExplanation',
    defaultMessage:
      'This feature allows you to automatically fetch the events added to the agendas of your choice.',
  },
  createAggregator: {
    id: 'aggregator-sources.Dashboard.createAggregator',
    defaultMessage: 'Activate agenda aggregation',
  },
  sourcesHelp: {
    id: 'aggregator-sources.Dashboard.sourcesHelp',
    defaultMessage: 'Click here to find out more about aggregations',
  },
  sourceAgendas: {
    id: 'aggregator-sources.Dashboard.sourceAgendas',
    defaultMessage: 'Source agendas',
  },
  sourcesExplanation: {
    id: 'aggregator-sources.Dashboard.sourcesExplanation',
    defaultMessage:
      'The events published by the agendas listed here are automatically added to the [{title}]({link}) agenda.',
  },
  searchAgenda: {
    id: 'aggregator-sources.Dashboard.searchAgenda',
    defaultMessage: 'Search an agenda',
  },
  numberOfResults: {
    id: 'aggregator-sources.Dashboard.numberOfResults',
    defaultMessage: 'Number of results',
  },
  noResult: {
    id: 'aggregator-sources.Dashboard.noResult',
    defaultMessage: 'No result found',
  },
  noSources: {
    id: 'aggregator-sources.Dashboard.noSources',
    defaultMessage:
      'Your agenda is not yet linked to any sources. Add a first source agenda!',
  },
  addASource: {
    id: 'aggregator-sources.Dashboard.addASource',
    defaultMessage: 'Add a source',
  },
  aggregationCountWarning: {
    id: 'aggregator-sources.Dashboard.aggregationCountWarning',
    defaultMessage:
      'Well done, you have aggregated {eventCount, number} events on this calendar!\nThe {version, select, free {free}} version allows you to create automatic aggregations up to {limit} events/year.\n<support-link>Contact technical support</support-link> to increase this threshold.',
  },
});

function Dashboard() {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const query = useMemo(
    () => qs.parse(location.search, { ignoreQueryPrefix: true }),
    [location.search]
  );
  const initialValues = useMemo(
    () => ({ search: query.search || '' }),
    [query]
  );
  const [value, setValue] = useState(
    query.search !== '' ? query.search : undefined
  );
  const [previousValue, setPreviousValue] = useState();

  const intl = useIntl();
  const dispatch = useDispatch();
  const apiClient = useApiClient();

  const { agenda: aggregatorAgenda, agendaSchema: aggregatorAgendaSchema } = useLayoutData();

  const res = useSelector(state => state.res);
  const loading = useSelector(state => _.get(state, 'sources.loading', true));
  const loaded = useSelector(state => _.get(state, 'sources.loaded'));
  const listLoading = useSelector(state => state.sources.listLoading);
  const aggregator = useSelector(state => state.sources.aggregator);
  const agendaSources = useSelector(state => state.sources.data);
  const nextLoading = useSelector(state => state.sources.nextLoading);
  const modals = useSelector(state => state.modals);
  const dev = useSelector(state => state.dev);

  const fuse = useMemo(
    () => new Fuse(agendaSources || [], fuseOptions),
    [agendaSources]
  );

  const filteredSources = useMemo(() => {
    if (value && value !== '') {
      return fuse.search(value);
    }

    return agendaSources;
  }, [fuse, value, agendaSources]);

  const search = useCallback(
    v => {
      setPreviousValue(value);
      setValue(v);

      // dispatch(sourcesActions.list({ search: v })).finally(() => {
      history.push({
        search: qs.stringify({ ...query, search: v || undefined }),
      });
      // });
    },
    [history, query, setPreviousValue, setValue, value]
  );

  const showModalAddSource = useCallback(
    () => dispatch(modalsActions.showModal('addSource')),
    [dispatch]
  );
  const showModalSetAggregatorRules = useCallback(
    () => dispatch(modalsActions.showModal('setAggregatorRules')),
    [dispatch]
  );

  const closeModalAddSource = useCallback(() => {
    dispatch(modalsActions.closeModal('addSource'));
    if (query.redirect) {
      window.location.href = query.redirect;
    }
  }, [dispatch, query.redirect]);
  const closeModalUpdateSource = useCallback(
    () => dispatch(modalsActions.closeModal('updateSource')),
    [dispatch]
  );
  const closeModalRemoveSource = useCallback(
    () => dispatch(modalsActions.closeModal('removeSource')),
    [dispatch]
  );
  const closeModalSetAggregatorRules = useCallback(
    () => dispatch(modalsActions.closeModal('setAggregatorRules')),
    [dispatch]
  );

  const debouncedSearch = useMemo(() => _.debounce(search, 400), [search]);

  const onSearch = useCallback(values => search(values.search), [search]);

  const refresh = useCallback(
    () => dispatch(sourcesActions.list({ query: value })),
    [dispatch, value]
  );

  const createAggregator = useCallback(
    () => dispatch(sourcesActions.createAggregator(params.slug)).then(() => dispatch(sourcesActions.loadAggregator(params.slug))),
    [dispatch, params.slug]
  );

  const setAggregatorRules = useCallback(
    rules => dispatch(sourcesActions.setAggregatorRules(rules)).then(() => {
      closeModalSetAggregatorRules();

      return dispatch(sourcesActions.loadAggregator(params.slug));
    }),
    [closeModalSetAggregatorRules, dispatch, params.slug]
  );
  const addSource = useCallback(
    (sourceAgenda, rules, evaluate) => dispatch(sourcesActions.add(sourceAgenda.uid, { rules, evaluate })).then(
      () => refresh()
    ),
    [dispatch, refresh]
  );
  const updateSource = useCallback(
    (source, rules, evaluate) => dispatch(sourcesActions.update(source.id, { rules, evaluate })).then(() => refresh()),
    [dispatch, refresh]
  );
  const removeSource = useCallback(
    (source, evaluate) => dispatch(sourcesActions.remove(source.id, { evaluate })).then(() => {
      closeModalRemoveSource();

      if (query.redirect) {
        window.location.href = query.redirect;
        return;
      }

      return refresh();
    }),
    [dispatch, closeModalRemoveSource, query.redirect, refresh]
  );

  const initialQuery = useRef(query);

  useEffect(() => {
    dispatch(sourcesActions.load(params.slug, initialQuery.current));
    dispatch(sourcesActions.loadAggregator(params.slug));
  }, [dispatch, params.slug]);

  const queryValue = dev?.query ?? query;

  useEffect(() => {
    if (!loaded || !queryValue.source) {
      return;
    }

    (async () => {
      const { sources } = await apiClient.get(
        res.list.replace(':slug', aggregatorAgenda.slug),
        { params: { slug: queryValue.source } }
      );

      if (queryValue.source && sources.length === 1) {
        const source = sources[0];

        const schema = await apiClient.get(
          `/${source.agenda.slug}/settings/schema`
        );

        dispatch(
          modalsActions.showModal('updateSource', {
            source,
            schema,
          })
        );

        return history.replace({
          search: qs.stringify({ ...queryValue, source: undefined }),
        });
      }

      const [_agenda, schema] = await Promise.all([
        apiClient.get(res.getAgenda.replace(':slug', queryValue.source)),
        apiClient.get(`/${queryValue.source}/settings/schema`),
      ]).catch(() => []);

      _agenda.schema = schema;

      if (_agenda?.uid) {
        dispatch(
          modalsActions.showModal('addSource', {
            preselectedAgenda: _agenda,
          })
        );
      }

      history.replace({
        search: qs.stringify({ ...queryValue, source: undefined }),
      });
    })();
  }, [
    dispatch,
    aggregatorAgenda.slug,
    res.list,
    res.getAgenda,
    loaded,
    queryValue,
    apiClient,
    history,
  ]);

  useEffect(() => {
    if (!loaded || !query.removeSource) {
      return;
    }

    (async () => {
      // search agenda in sources
      const source = agendaSources.find(
        v => v.agenda.slug === query.removeSource
      );

      if (source?.id) {
        dispatch(modalsActions.showModal('removeSource', { source }));
      }

      history.replace({
        search: qs.stringify({ ...query, removeSource: undefined }),
      });
    })();
  }, [
    dispatch,
    query.removeSource,
    res.getAgenda,
    loaded,
    query,
    agendaSources,
    history,
  ]);

  if (loading) {
    return (
      <div className="padding-v-md" style={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  if (!aggregator) {
    return <Presentation intl={intl} onCreate={createAggregator} />;
  }

  return (
    <div>
      {aggregator?.limitIsReached ? (
        <div
          className="padding-all-sm padding-bottom-sm margin-bottom-md"
          css={css`
            background-color: #fafafa;
            border-radius: 0;
            border: #41acdd 1px solid;
          `}
        >
          {intl.formatMessage(messages.aggregationCountWarning, {
            limit: aggregator.limit,
            br: <br />,
            'support-link': chunks => (
              <a
                className="btn btn-primary"
                href={`/support?origin=${encodeURIComponent(
                  location.pathname
                )}`}
              >
                {chunks}
              </a>
            ),
          })}
        </div>
      ) : null}

      {aggregator ? (
        <AggregatorRules
          showModal={showModalSetAggregatorRules}
          rules={aggregator.rules}
          schema={aggregatorAgendaSchema}
        />
      ) : null}

      {agendaSources?.length ? (
        <div>
          <Form initialValues={initialValues} onSubmit={onSearch}>
            {({ handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <Field
                  component={SearchInput}
                  name="search"
                  type="text"
                  classNameGroup="form-group search margin-v-z"
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
          <div className="padding-v-sm">
            <span>
              {intl.formatMessage(messages.numberOfResults)}:{' '}
              {filteredSources.length}{' '}
            </span>
            -{' '}
            <button
              type="button"
              className="btn btn-link-inline"
              onClick={showModalAddSource}
            >
              {intl.formatMessage(messages.addASource)}
            </button>
            <ReactMarkdown className="text-muted">
              {intl.formatMessage(messages.sourcesExplanation, {
                title: aggregatorAgenda.title,
                link: res.showAgenda.replace(':slug', aggregatorAgenda.slug),
              })}
            </ReactMarkdown>
          </div>
          <SourcesList
            sources={filteredSources}
            aggregatorAgendaSchema={aggregatorAgendaSchema}
          />
          {!filteredSources?.length ? (
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
      ) : (
        <div>
          <p>{intl.formatMessage(messages.noSources)}</p>
          <div className="text-center margin-v-md">
            <button
              type="button"
              className="btn btn-primary"
              onClick={showModalAddSource}
            >
              {intl.formatMessage(messages.addASource)}
            </button>
          </div>
        </div>
      )}

      {modals.setAggregatorRules?.visible ? (
        <AggregatorRulesModal
          aggregator={aggregator}
          aggregatorAgenda={aggregatorAgenda}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
          onClose={closeModalSetAggregatorRules}
          onSubmit={setAggregatorRules}
        />
      ) : null}

      {modals.addSource?.visible ? (
        <AddSourceModal
          aggregator={aggregator}
          aggregatorAgenda={aggregatorAgenda}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
          preselectedAgenda={modals.addSource.preselectedAgenda}
          onClose={closeModalAddSource}
          onSubmit={addSource}
        />
      ) : null}
      {modals.updateSource?.visible ? (
        <UpdateSourceModal
          aggregator={aggregator}
          aggregatorAgenda={aggregatorAgenda}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
          onClose={closeModalUpdateSource}
          onSubmit={updateSource}
        />
      ) : null}
      {modals.removeSource?.visible ? (
        <RemoveSourceModal
          onClose={closeModalRemoveSource}
          onRemove={removeSource}
        />
      ) : null}
    </div>
  );
}

export default Dashboard;
