import { ReactSelectInput } from '@openagenda/react-shared';
import React, { useCallback, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectInput;

const messages = defineMessages({
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

export default function SortSelector({ onFilterChange, query }) {
  const intl = useIntl();

  const orderOptions = useMemo(
    () => [
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
    option => onFilterChange({ ...query, sort: option.value }),
    [onFilterChange, query]
  );

  const value = query.sort === 'updatedAt.desc' ? orderOptions[1] : orderOptions[0];

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
