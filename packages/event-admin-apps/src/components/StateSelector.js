import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { ReactSelectInput } from '@openagenda/react-shared';
import { css } from '@emotion/react';
import stateMessages from '../messages/states';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectInput;

const stateBadgeCss = css`
  height: 19px;
  width: 19px;
  vertical-align: baseline;
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
    cursor: 'pointer',
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
  placeholder: provided => ({
    ...provided,
    position: 'relative',
    transform: 'none',
    top: 0,
  }),
};

export default function StateSelector({ value, onChange, ...otherProps }) {
  const intl = useIntl();

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

  const selectValue = useMemo(
    () => stateOptions.find(o => o.value === value),
    [value, stateOptions]
  );

  return (
    <ReactSelectInput
      options={stateOptions}
      value={selectValue}
      onChange={onChange}
      styles={stateSelectStyles}
      isSearchable={false}
      isClearable={false}
      {...otherProps}
    />
  );
}
