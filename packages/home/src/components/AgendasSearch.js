import _ from 'lodash';
import React, { useCallback, useMemo, useEffect, useContext } from 'react';
import { Form, Field } from 'react-final-form';
import useApiClient from '@openagenda/react-utils/dist/useApiClient';
import useAgendasSearch from '../hooks/useAgendasSearch';
import SearchInput from './SearchInput';
import I18nContext from '../contexts/I18nContext';

function AgendasSearch({ res, render, initialState = {}, onSearch }) {
  const { getLabel } = useContext(I18nContext);
  const apiClient = useApiClient();

  const initialValues = useMemo(
    () => ({
      search: initialState.searchValue
    }),
    [initialState.searchValue]
  );

  const agendasSearchRequest = useCallback(
    ({ search, page }) => apiClient.get(res, {
      params: {
        search: search === '' ? undefined : search,
        page
      }
    }),
    [apiClient, res]
  );

  const { state, list, nextPage } = useAgendasSearch({
    request: agendasSearchRequest,
    perPageLimit: 20,
    initialState
  });

  const debouncedList = useMemo(() => _.debounce(list, 400), [list]);
  const throttledNextPage = useMemo(
    () => _.throttle(nextPage, 400, { trailing: false }),
    [nextPage]
  );

  const handleSearch = useCallback(
    values => list(values.search),
    [list]
  );

  useEffect(
    () => {
      list(state.searchValue).catch(_.noop);
    },
    [list]
  );

  useEffect(
    () => {
      if (typeof onSearch === 'function') {
        onSearch(state.searchValue);
      }
    },
    [onSearch, state.searchValue]
  );

  const renderForm = useCallback(
    ({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <Field
          component={SearchInput}
          name="search"
          type="text"
          classNameGroup="form-group search"
          className="form-control"
          placeholder={getLabel('searchAgenda')}
          action={debouncedList}
          loading={state.listLoading}
          autoComplete="off"
          autoFocus
        />
      </form>
    ),
    [getLabel, debouncedList, state.listLoading]
  );

  const form = useMemo(
    () => <Form initialValues={initialValues} onSubmit={handleSearch} render={renderForm} />,
    [handleSearch, renderForm]
  );

  return render({ state, form, nextPage: throttledNextPage });
}

export default React.memo(AgendasSearch);
