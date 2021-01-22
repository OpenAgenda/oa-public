import React, { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { ReactSelectInput, useApiClient } from '@openagenda/react-shared';
import { css } from '@emotion/react';
import stateMessages from '../messages/states';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectInput;

const stateBadgeCss = css`
  height: 19px;
  width: 19px;
`;

const stateSelectStyles = {
  ...defaultReactSelectStyles,
  container: provided => ({
    ...provided,
    display: 'inline-block',
  }),
  control: (provided, state) => ({
    ...defaultReactSelectStyles.control(provided, state),
    transition: 'none',
    border: 'none',
    WebkitBoxShadow: 'none',
    boxShadow: 'none',
    cursor: 'pointer',
    minWidth: 0,
    minHeight: 0,
  }),
  valueContainer: (provided, state) => ({
    ...defaultReactSelectStyles.valueContainer(provided, state),
    padding: 0,
  }),
  singleValue: provided => ({
    ...provided,
    top: 0,
    transform: 'none',
    position: 'relative',
    overflow: 'visible',
    marginRight: 0,
  }),
  option: provided => ({
    ...provided,
    display: 'flex',
  }),
  dropdownIndicator: provided => ({
    ...provided,
    padding: 0,
    verticalAlign: 'middle',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (provided, state) => ({
    ...defaultReactSelectStyles.menu(provided, state),
    minWidth: '150px',
  }),
};

export default function StateSelector({ agenda, event, pageIndex }) {
  const intl = useIntl();
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const stateOptions = useMemo(
    () => [
      {
        label: (
          <>
            <span
              className="badge badge-danger margin-right-xs"
              css={stateBadgeCss}
            >
              &nbsp;
            </span>
            {intl.formatMessage(stateMessages.refused)}
          </>
        ),
        value: -1,
      },
      {
        label: (
          <>
            <span
              className="badge badge-default margin-right-xs"
              css={stateBadgeCss}
            >
              &nbsp;
            </span>
            {intl.formatMessage(stateMessages.toModerate)}
          </>
        ),
        value: 0,
      },
      {
        label: (
          <>
            <span
              className="badge badge-warning margin-right-xs"
              css={stateBadgeCss}
            >
              &nbsp;
            </span>
            {intl.formatMessage(stateMessages.controlled)}
          </>
        ),
        value: 1,
      },
      {
        label: (
          <>
            <span
              className="badge badge-success margin-right-xs"
              css={stateBadgeCss}
            >
              &nbsp;
            </span>
            {intl.formatMessage(stateMessages.published)}
          </>
        ),
        value: 2,
      },
    ],
    [intl]
  );

  const state = useMemo(() => stateOptions.find(o => o.value === event.state), [
    event.state,
    stateOptions,
  ]);

  const mutation = useMutation(
    value => apiClient.post(`/${agenda.slug}/events/${event.slug}/state`, {
      state: value,
    }),
    {
      onSuccess: (result, value) => {
        const query = queryClient.getQueryCache().find(['events']);

        const queryData = query.state.data;
        const pageData = queryData.pages[pageIndex];
        const eventIndex = pageData.events.findIndex(
          v => v.slug === event.slug
        );

        const eventData = {
          ...pageData.events[eventIndex],
          state: value,
        };

        queryClient.setQueryData(query.queryKey, {
          ...queryData,
          pages: [
            ...queryData.pages.slice(0, pageIndex),
            {
              ...pageData,
              events: [
                ...pageData.events.slice(0, eventIndex),
                eventData,
                ...pageData.events.slice(eventIndex + 1),
              ],
            },
            ...queryData.pages.slice(pageIndex + 1),
          ],
        });
      },
    }
  );

  const onChange = useCallback(option => mutation.mutate(option.value), [
    mutation,
  ]);

  return (
    <ReactSelectInput
      options={stateOptions}
      value={state}
      onChange={onChange}
      styles={stateSelectStyles}
      isSearchable={false}
      isClearable={false}
      isDisabled={mutation.isLoading}
      isLoading={mutation.isLoading}
    />
  );
}
