import debounce from 'lodash/debounce.js';
import throttle from 'lodash/throttle.js';
import noop from 'lodash/noop.js';
import React, {
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Form, Field } from 'react-final-form';
import { useApiClient } from '@openagenda/react-shared';
import useAgendasSearch from '../hooks/useAgendasSearch.js';
import SearchInput from './SearchInput.js';

const AgendasSearch = forwardRef(
  ({ res, render, initialState = {}, onSearch, fieldProps }, ref) => {
    const apiClient = useApiClient();

    const initialValues = useMemo(
      () => ({
        search: initialState.searchValue,
      }),
      [initialState.searchValue],
    );

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
      initialState,
    });

    useImperativeHandle(ref, () => ({
      refresh: () => list(state.searchValue),
    }));

    const debouncedList = useMemo(() => debounce(list, 400), [list]);
    const throttledNextPage = useMemo(
      () => throttle(nextPage, 400, { trailing: false }),
      [nextPage],
    );

    const handleSearch = useCallback((values) => list(values.search), [list]);

    useEffect(() => {
      list(state.searchValue).catch(noop);
    }, [list, state.searchValue]);

    useEffect(() => {
      if (typeof onSearch === 'function') {
        onSearch(state.searchValue);
      }
    }, [onSearch, state.searchValue]);

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
      () => (
        <Form
          initialValues={initialValues}
          onSubmit={handleSearch}
          render={renderForm}
        />
      ),
      [handleSearch, initialValues, renderForm],
    );

    return render({ state, form, nextPage: throttledNextPage });
  },
);

export default React.memo(AgendasSearch);
