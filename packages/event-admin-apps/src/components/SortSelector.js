import { ReactSelectInput } from '@openagenda/react-shared';
import React, { useCallback, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectInput;

const messages = defineMessages({
  relevance: {
    id: 'EventAdminApp.SortSelector.relevance',
    defaultMessage: 'Relevance',
  },
  chronological: {
    id: 'EventAdminApp.SortSelector.chronological',
    defaultMessage: 'Chronological order',
  },
  recentlyUpdated: {
    id: 'EventAdminApp.SortSelector.recentlyUpdated',
    defaultMessage: 'Recently updated',
  },
});

const stateSelectStyles = {
  ...defaultReactSelectStyles,
  container: provided => ({
    ...provided,
    display: 'inline-block',
    width: '180px',
  }),
  control: (provided, state) => ({
    ...defaultReactSelectStyles.control(provided, state),
    cursor: 'pointer',
  }),
  valueContainer: (provided, state) => ({
    ...defaultReactSelectStyles.valueContainer(provided, state),
    padding: '0 4px',
  }),
};

export default function SortSelector({ query, setQuery }) {
  const intl = useIntl();

  const orderOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(messages.relevance),
        value: 'score',
        // isDisabled: true
      },
      {
        label: intl.formatMessage(messages.chronological),
        value: 'timings.asc',
      },
      {
        label: intl.formatMessage(messages.recentlyUpdated),
        value: 'updatedAt.desc',
      },
    ],
    [intl]
  );

  const onChange = useCallback(
    option => setQuery({ ...query, sort: option.value }),
    [setQuery, query]
  );

  const value = orderOptions.find(option => option.value === query.sort) || orderOptions[1];

  return (
    <ReactSelectInput
      options={orderOptions}
      value={value}
      onChange={onChange}
      styles={stateSelectStyles}
      isSearchable={false}
      isClearable={false}
    />
  );
}
