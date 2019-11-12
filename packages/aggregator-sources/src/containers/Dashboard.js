import _ from 'lodash';
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { hot } from 'react-hot-loader/root';
import { useHistory, useParams } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Field } from 'react-final-form';
import ReactMarkdown from 'react-markdown';
import qs from 'qs';
import Fuse from 'fuse.js';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import Spinner from '@openagenda/react-components/build/Spinner';
import * as modalsActions from '../reducers/modals';
import * as sourcesActions from '../reducers/sources';
import SearchInput from '../components/SearchInput';
import SourcesList from '../components/SourcesList';
import AddSourceModal from '../components/AddSourceModal';
import UpdateSourceModal from '../components/UpdateSourceModal';
import RemoveSourceModal from '../components/RemoveSourceModal';

const fuseOptions = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['agenda.title']
};

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

function Dashboard({ agenda }) {
  const history = useHistory();
  const params = useParams();
  const query = useMemo(
    () => qs.parse(history.location.search, { ignoreQueryPrefix: true }),
    [history.location.search]
  );
  const initialValues = useMemo(() => ({ search: query.search || '' }), [
    query
  ]);
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

  const fuse = useMemo(() => new Fuse(agendaSources, fuseOptions), [
    agendaSources
  ]);

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
        ...history.location,
        search: qs.stringify({ ...query, search: v || undefined })
      });
      // });
    },
    [history, query, setPreviousValue, setValue, value]
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
    () => dispatch(modalsActions.closeModal('updateSource')),
    [dispatch]
  );
  const closeModalRemoveSource = useCallback(
    () => dispatch(modalsActions.closeModal('removeSource')),
    [dispatch]
  );

  const debouncedSearch = useMemo(() => _.debounce(search, 400), [search]);

  const onSearch = useCallback(values => search(values.search), [search]);

  const refresh = useCallback(() => search(value), [search, value]);

  const addSource = useCallback(
    (sourceAgenda, rules, evaluate) => dispatch(sourcesActions.add(sourceAgenda.uid, { rules, evaluate })).then(
      () => {
        closeModalAddSource();

        return refresh();
      }
    ),
    [dispatch, closeModalAddSource, refresh]
  );
  const updateSource = useCallback(
    (source, rules) => dispatch(sourcesActions.update(source.id, { rules })).then(() => {
      closeModalUpdateSource();

      return refresh();
    }),
    [dispatch, closeModalUpdateSource, refresh]
  );
  const removeSource = useCallback(
    (source, evaluate) => dispatch(sourcesActions.remove(source.id, { evaluate })).then(() => {
      closeModalRemoveSource();

      return refresh();
    }),
    [dispatch, closeModalRemoveSource, refresh]
  );

  const initialQuery = useRef(query);

  useEffect(() => {
    dispatch(sourcesActions.load(params.slug, initialQuery.current));
  }, [dispatch, params.slug]);

  if (loading) {
    return (
      <div className="padding-v-md" style={{ position: 'relative' }}>
        <Spinner />
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
            source={intl.formatMessage(messages.sourcesExplanation, {
              title: agenda.title,
              link: res.showAgenda.replace(':slug', agenda.slug)
            })}
          />
        </div>
        <Form initialValues={initialValues} onSubmit={onSearch}>
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field
                component={SearchInput}
                name="search"
                type="text"
                classNameGroup="form-group search margin-v-md"
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
          {intl.formatMessage(messages.numberOfResults)}:{' '}
          {filteredSources.length} -{' '}
          <button
            type="button"
            className="btn btn-link-inline"
            onClick={showModalAddSource}
          >
            {intl.formatMessage(messages.addASource)}
          </button>
        </p>

        <SourcesList sources={filteredSources} />

        {!filteredSources || !filteredSources.length ? (
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
        <AddSourceModal
          aggregator={agenda}
          onClose={closeModalAddSource}
          onSubmit={addSource}
        />
      ) : null}
      {modals.updateSource && modals.updateSource.visible ? (
        <UpdateSourceModal
          onClose={closeModalUpdateSource}
          onSubmit={updateSource}
        />
      ) : null}
      {modals.removeSource && modals.removeSource.visible ? (
        <RemoveSourceModal
          onClose={closeModalRemoveSource}
          onRemove={removeSource}
        />
      ) : null}
    </div>
  );
}

export default module.hot ? hot(Dashboard) : Dashboard;
