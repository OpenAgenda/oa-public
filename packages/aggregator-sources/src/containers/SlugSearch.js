import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { defineMessages, useIntl } from 'react-intl';
import useApiClient from '@openagenda/react-utils/dist/useApiClient';
import useSlugSearch from '../hooks/useSlugSearch';
import SearchInput from '../components/SearchInput';

const messages = defineMessages({
  enterLink: {
    id: 'aggregator-sources.SlugSearch.searchAgenda',
    defaultMessage: 'Enter an agenda page link'
  }
});

export default function SlugSearch({ res, render }) {
  const intl = useIntl();
  const apiClient = useApiClient();

  const validSlugRequest = useCallback(
    v => {
      try {
        const slug = new URL(v).pathname.split('/')[1];

        return apiClient.get(res.replace(':slug', slug));
      } catch (e) {
        return Promise.reject(new Error('badAgendaUrl'));
      }
    },
    [apiClient, res]
  );

  const { state, get } = useSlugSearch({ request: validSlugRequest });

  const debouncedGet = useMemo(() => _.debounce(get, 400), [get]);

  const onSearch = useCallback(values => get(values.slug), [get]);

  const renderForm = useCallback(
    ({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <Field
          component={SearchInput}
          name="search"
          type="text"
          classNameGroup="search margin-top-md margin-bottom-sm"
          className="form-control"
          placeholder={intl.formatMessage(messages.enterLink)}
          action={debouncedGet}
          loading={state.loading}
          intl={intl}
          autoFocus
        />
      </form>
    ),
    [intl, debouncedGet, state.loading]
  );

  const form = useMemo(() => <Form onSubmit={onSearch} render={renderForm} />, [
    onSearch,
    renderForm
  ]);

  return render({ state, form });
}
