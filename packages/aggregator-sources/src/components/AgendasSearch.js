import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { useApiClient } from '@openagenda/react-shared';
import useAgendasSearch from '../hooks/useAgendasSearch.js';
import SearchInput from './SearchInput.js';

function AgendasSearch({ res, render, fieldProps }) {
  const apiClient = useApiClient();

  const agendasSearchRequest = useCallback(
    ({ search, page }) =>
      apiClient
        .get(res, {
          searchParams: {
            search: search === '' ? undefined : search,
            page,
          },
        })
        .json(),
    [apiClient, res],
  );

  const { state, list, nextPage } = useAgendasSearch({
    request: agendasSearchRequest,
    perPageLimit: 20,
  });

  const debouncedList = useMemo(() => _.debounce(list, 400), [list]);
  const throttledNextPage = useMemo(
    () => _.throttle(nextPage, 400, { trailing: false }),
    [nextPage],
  );

  const onSearch = useCallback((values) => list(values.search), [list]);

  const renderForm = useCallback(
    ({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <Field
          component={SearchInput}
          name="search"
          type="text"
          action={debouncedList}
          loading={state.listLoading}
          {...fieldProps}
        />
      </form>
    ),
    [debouncedList, state.listLoading, fieldProps],
  );

  const form = useMemo(
    () => <Form onSubmit={onSearch} render={renderForm} />,
    [onSearch, renderForm],
  );

  return render({ state, form, nextPage: throttledNextPage });
}

export default React.memo(AgendasSearch);
