import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { defineMessages, useIntl } from 'react-intl';
import useApiClient from '@openagenda/react-utils/dist/useApiClient';
import useAgendasSearch from '../hooks/useAgendasSearch';
import SearchInput from '../components/SearchInput';

const messages = defineMessages({
  searchAgenda: {
    id: 'aggregator-sources.AgendasSearch.searchAgenda',
    defaultMessage: 'Search an agenda'
  }
});

function AgendasSearch({ res, render }) {
  const intl = useIntl();
  const apiClient = useApiClient();

  const agendasSearchRequest = useCallback(
    v => apiClient.get(res, {
      params: {
        search: v === '' ? undefined : v
      }
    }),
    [apiClient, res]
  );

  const { state, list } = useAgendasSearch({ request: agendasSearchRequest });

  const debouncedList = useMemo(() => _.debounce(list, 400), [list]);

  const onSearch = useCallback(values => list(values.search), [list]);

  // useEffect(
  //   () => {
  //     list().catch(_.noop);
  //   },
  //   [list]
  // );

  const renderForm = useCallback(
    ({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <Field
          component={SearchInput}
          name="search"
          type="text"
          classNameGroup="search margin-top-md margin-bottom-sm"
          className="form-control"
          placeholder={intl.formatMessage(messages.searchAgenda)}
          action={debouncedList}
          loading={state.listLoading}
          intl={intl}
          autoFocus
        />
      </form>
    ),
    [intl, debouncedList, state.listLoading]
  );

  const form = useMemo(() => <Form onSubmit={onSearch} render={renderForm} />, [
    onSearch,
    renderForm
  ]);

  return render({ state, form });
}

export default React.memo(AgendasSearch);
