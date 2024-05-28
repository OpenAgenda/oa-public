import React, { useCallback, useMemo, useState } from 'react';
import { Field, useField } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { useIntl } from 'react-intl';
import { css } from '@emotion/react';
import ChoiceField from '../fields/ChoiceField';
import Title from '../Title';
import Panel from '../Panel';
import FilterPreviewer from '../FilterPreviewer';
import useChoiceState from '../../hooks/useChoiceState';
import messages from '../../messages/choiceFilter';

const subscription = { value: true };

function parseValue(value) {
  if (Array.isArray(value) && !value.length) {
    return undefined;
  }

  return value;
}

function formatValue(value) {
  // if (value !== undefined) {
  //   return [].concat(value);
  // }

  return value;
}

function Preview({
  name,
  filter,
  getOptions,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = useIntl();
  const { input } = useField(name, { subscription });
  const options = useMemo(() => getOptions(filter), [filter, getOptions]);

  const valueOptions = useMemo(() => {
    if ([undefined, null, ''].includes(input?.value)) {
      return [];
    }

    if (!options.length) {
      return [];
    }

    return [].concat(input.value).map(
      v =>
        options.find(option => option.value === v) ?? {
          value: v,
          label: intl.formatMessage(messages.unrecognizedOption, { value: v }),
        },
    );
  }, [input.value, options, intl]);

  const onRemove = useCallback(
    option => e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      // radio value is not an array
      if (!Array.isArray(input.value)) {
        input.onChange(undefined);
        return;
      }

      const newValue = input.value.filter(v => v !== option.value);

      input.onChange(newValue.length ? newValue : undefined);
    },
    [input, disabled],
  );

  if (!valueOptions?.length) {
    return null;
  }

  return React.createElement(component, {
    name,
    filter,
    getOptions,
    valueOptions,
    onRemove,
    disabled,
    ...rest,
  });
}

const ChoiceFilter = React.forwardRef(function ChoiceFilter(
  {
    name,
    filter,
    getTotal,
    getOptions,
    disabled,
    collapsed,
    inputType = 'checkbox',
    pageSize = 10,
    searchMinSize = 2 * pageSize,
    sort,
    tag,
  },
  _ref,
) {
  const intl = useIntl();
  const seed = useUIDSeed();

  const {
    options,
    searchValue,
    onSearchChange,
    foundOptions,
    countOptions,
    hasMoreOptions,
    moreOptions,
    lessOptions,
  } = useChoiceState({
    filter,
    getOptions,
    collapsed,
    pageSize,
    sort,
  });

  return (
    <>
      {options.length > searchMinSize ? (
        <input
          className="form-control input-sm margin-top-xs"
          value={searchValue}
          onChange={onSearchChange}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          css={css`
            width: 50%;
          `}
        />
      ) : null}

      {foundOptions.length === 0 ? (
        <div className="text-muted margin-v-xs">
          {intl.formatMessage(messages.noResult)}
        </div>
      ) : null}

      {foundOptions.map((option, index) =>
        (index < countOptions ? (
          <Field
            key={seed(option)}
            name={name}
            subscription={subscription}
            parse={parseValue}
            format={formatValue}
            component={ChoiceField}
            type={inputType}
            value={option.value}
            option={option}
            filter={filter}
            getTotal={getTotal}
            disabled={disabled}
            tag={tag}
          />
        ) : null))}

      {hasMoreOptions ? (
        <button
          type="button"
          className="btn btn-link btn-link-inline"
          onClick={moreOptions}
        >
          {intl.formatMessage(messages.moreOptions)}
        </button>
      ) : null}

      {!hasMoreOptions && countOptions > pageSize ? (
        <button
          type="button"
          className="btn btn-link btn-link-inline"
          onClick={lessOptions}
        >
          {intl.formatMessage(messages.lessOptions)}
        </button>
      ) : null}
    </>
  );
});

const Collapsable = React.forwardRef(function Collapsable(
  { name, filter, component, getTotal, getOptions, disabled, ...rest },
  ref,
) {
  const [collapsed, setCollapsed] = useState(filter.defaultCollapsed ?? true);

  return (
    <Panel
      header={(
        <Title
          name={name}
          filter={filter}
          component={Preview}
          getOptions={getOptions}
          disabled={disabled}
        />
      )}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      <ChoiceFilter
        ref={ref}
        name={name}
        filter={filter}
        component={component}
        getTotal={getTotal}
        getOptions={getOptions}
        disabled={disabled}
        collapsed={collapsed}
        {...rest}
      />
    </Panel>
  );
});

const exported = React.memo(ChoiceFilter);

// React.memo lose statics
exported.Preview = Preview;
exported.Collapsable = Collapsable;

export default exported;
