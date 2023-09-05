import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Field, useForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import ReactSelectField from '@openagenda/react-shared/lib/components/ReactSelectField';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectField;

const messages = defineMessages({
  relevance: {
    id: 'ReactFilters.Sort.relevance',
    defaultMessage: 'Relevance',
  },
  chronological: {
    id: 'ReactFilters.Sort.chronological',
    defaultMessage: 'Chronological order',
  },
  recentlyUpdated: {
    id: 'ReactFilters.Sort.recentlyUpdated',
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
  option: provided => ({
    ...provided,
    cursor: 'pointer',
  }),
};

export default function Sort() {
  const intl = useIntl();
  const form = useForm();

  const [userSort, setUserSort] = useState(() => {
    return form.getState().values.sort;
  });

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

  return (
    <>
      <ReactSelectField
        Field={Field}
        name="sort"
        options={orderOptions}
        styles={stateSelectStyles}
        isSearchable={false}
        isClearable={false}
        defaultValue="updatedAt.desc"
      />
      <OnChange name="sort">
        {value => {
          // user change
          if (form.getState().active === 'sort') {
            setUserSort(value);
          }
        }}
      </OnChange>
      <OnChange name="search">
        {(value, previousValue) => {
          const { sort } = form.getState().values;

          if (previousValue === '' && value !== '') {
            // search added
            setUserSort(sort);
            form.change('sort', 'score');
          } else if (sort === 'score' && previousValue !== '' && value === '') {
            // search removed
            form.change('sort', userSort && userSort !== '' ? userSort : undefined);
          }
        }}
      </OnChange>
    </>
  );
}
