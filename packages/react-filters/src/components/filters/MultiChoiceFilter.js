import React, {
  useCallback, useLayoutEffect, useMemo, useState
} from 'react';
import { Field, useForm, useField } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { OnChange } from 'react-final-form-listeners';
import { useDebouncedCallback } from 'use-debounce';
import Fuse from 'fuse.js';
import { usePrevious } from 'react-use';
import { defineMessages, useIntl } from 'react-intl';
import { css } from '@emotion/react';
import { useConstant } from '@openagenda/react-shared';
import useFilterTitle from '../../hooks/useFilterTitle';
import Checkbox from '../fields/Checkbox';
import Panel from '../Panel';
import ValueBadge from '../ValueBadge';

const OPTIONS_PAGE_SIZE = 10;
const SEARCH_MIN_SIZE = 2 * OPTIONS_PAGE_SIZE;

const messages = defineMessages({
  noResult: {
    id: 'ReactFilters.MultiChoiceFilter.noResult',
    defaultMessage: 'No result',
  },
  searchPlaceholder: {
    id: 'ReactFilters.MultiChoiceFilter.searchPlaceholder',
    defaultMessage: 'Search',
  },
  moreOptions: {
    id: 'ReactFilters.MultiChoiceFilter.moreOptions',
    defaultMessage: 'More options',
  },
  lessOptions: {
    id: 'ReactFilters.MultiChoiceFilter.lessOptions',
    defaultMessage: 'Less options',
  },
});

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

function DefaultPreviewRenderer({
  valueOptions,
  onRemove,
  disabled,
  className,
}) {
  return (
    <span className={className}>
      {valueOptions.map(option => (
        <ValueBadge
          key={option.value}
          label={option.label}
          onRemove={onRemove(option)}
          disabled={disabled}
        />
      ))}
    </span>
  );
}

function Preview({
  name,
  filter,
  getOptions,
  component = DefaultPreviewRenderer,
  disabled,
  ...rest
}) {
  const { input } = useField(name, { subscription });
  const options = useMemo(() => getOptions(filter), [filter, getOptions]);

  const valueOptions = useMemo(() => {
    if ([undefined, null, ''].includes(input?.value)) {
      return [];
    }

    if (!Array.isArray(input.value)) {
      return [options.find(option => option.value === input.value)];
    }

    return input.value.map(v => options.find(option => option.value === v));
  }, [input.value, options]);

  const onRemove = useCallback(
    option => e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      const newValue = input.value.filter(v => v !== option.value);

      input.onChange(newValue.length ? newValue : undefined);
    },
    [input, disabled]
  );

  if (!valueOptions || valueOptions === '') {
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

function Title({
  name, filter, getOptions, disabled
}) {
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = useField(name, { subscription });

  const { input } = field;

  if (!input.value?.length) {
    return <div>{title}</div>;
  }

  return (
    <div className="flex-auto">
      {title}
      <Preview
        name={name}
        filter={filter}
        title={title}
        getOptions={getOptions}
        disabled={disabled}
        className="oa-filter-value-preview"
      />
    </div>
  );
}

function MultiChoiceFilter(
  {
    name, filter, getTotal, getOptions, disabled
  },
  _ref
) {
  const intl = useIntl();
  const form = useForm();
  const seed = useUIDSeed();
  const [maxOptions, setMaxOptions] = useState(OPTIONS_PAGE_SIZE);
  const [collapsed, setCollapsed] = useState(true);

  const onChange = useDebouncedCallback(() => form.submit(), 1);

  const options = useMemo(() => getOptions(filter), [filter, getOptions]);

  const [optionSearch, setOptionSearch] = useState('');
  const previousOptionSearch = usePrevious(optionSearch);
  const [foundOptions, setFoundOptions] = useState(options);

  const moreOptions = useCallback(
    () => setMaxOptions(v => v + OPTIONS_PAGE_SIZE),
    []
  );
  const lessOptions = useCallback(() => setMaxOptions(OPTIONS_PAGE_SIZE), []);

  const onCollapsedChange = useCallback(
    value => {
      setCollapsed(value);

      if (value) {
        lessOptions();
      }
    },
    [lessOptions]
  );

  const hasMoreOptions = maxOptions < foundOptions.length;

  const onSearchChange = useCallback(e => setOptionSearch(e.target.value), []);

  const fuse = useConstant(
    () => new Fuse(options, {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      minMatchCharLength: 1,
      keys: ['label'],
    })
  );

  // Update fuse docs if options change
  useLayoutEffect(() => {
    if (options !== fuse._docs) {
      fuse.setCollection(options);
    }
  }, [fuse, options]);

  // Update search results if search change
  useLayoutEffect(() => {
    if (
      previousOptionSearch !== undefined
      && optionSearch !== previousOptionSearch
    ) {
      const newOptions = optionSearch === ''
        ? options
        : fuse.search(optionSearch).map(v => v.item);

      // if (newOptions.length <= OPTIONS_PAGE_SIZE || optionSearch === '') {
      //   lessOptions();
      // }

      setFoundOptions(newOptions);
    }
  }, [fuse, optionSearch, options, previousOptionSearch]);

  return (
    <Panel
      header={(
        <Title
          name={name}
          filter={filter}
          getOptions={getOptions}
          disabled={disabled}
        />
      )}
      collapsed={collapsed}
      setCollapsed={onCollapsedChange}
    >
      {options.length > SEARCH_MIN_SIZE ? (
        <input
          className="form-control input-sm margin-top-xs"
          value={optionSearch}
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

      {foundOptions.map((option, index) => (index < maxOptions ? (
        <Field
          key={seed(option)}
          name={name}
          subscription={subscription}
          parse={parseValue}
          format={formatValue}
          component={Checkbox}
          type="checkbox"
          value={option.value}
          option={option}
          filter={filter}
          getTotal={getTotal}
          disabled={disabled}
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

      {!hasMoreOptions && maxOptions > OPTIONS_PAGE_SIZE ? (
        <button
          type="button"
          className="btn btn-link btn-link-inline"
          onClick={lessOptions}
        >
          {intl.formatMessage(messages.lessOptions)}
        </button>
      ) : null}

      <OnChange name={name}>{onChange}</OnChange>
    </Panel>
  );
}

const exported = React.memo(React.forwardRef(MultiChoiceFilter));

// React.memo lose statics
exported.Preview = Preview;

export default exported;
