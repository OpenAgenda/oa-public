import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Field, useForm, useFormState } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import ReactSelectField from '@openagenda/react-shared/components/ReactSelectField';
import messages from '../messages/sort.js';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectField;

const stateSelectStyles = {
  ...defaultReactSelectStyles,
  container: (provided) => ({
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
  option: (provided) => ({
    ...provided,
    cursor: 'pointer',
  }),
};

// what the closed select shows, where room is short; the menu has the label
const shortMessages = {
  score: messages.relevance,
  'timings.asc': messages.chronologicalShort,
  'timingsWithFeatured.asc': messages.chronologicalShort,
  'lastTiming.asc': messages.chronologicalShort,
  'lastTimingWithFeatured.asc': messages.chronologicalShort,
  'updatedAt.desc': messages.recentlyUpdated,
  'updatedAt.asc': messages.leastRecentlyUpdatedShort,
};

const descriptionMessages = {
  score: messages.relevanceDescription,
  'timings.asc': messages.chronologicalDescription,
  'timingsWithFeatured.asc': messages.featuredThenChronologicalDescription,
  'lastTiming.asc': messages.lastDateDescription,
  'lastTimingWithFeatured.asc': messages.featuredThenLastDateDescription,
  'updatedAt.desc': messages.recentlyUpdatedDescription,
  'updatedAt.asc': messages.leastRecentlyUpdatedDescription,
};

const optionMessages = {
  score: messages.relevance,
  'timings.asc': messages.chronological,
  'timingsWithFeatured.asc': messages.featuredThenChronological,
  'lastTiming.asc': messages.lastDate,
  'lastTimingWithFeatured.asc': messages.featuredThenLastDate,
  'updatedAt.desc': messages.recentlyUpdated,
  'updatedAt.asc': messages.leastRecentlyUpdated,
};

// what a public listing wants; the agenda admin passes its own
const defaultOptions = [
  'lastTimingWithFeatured.asc',
  'timingsWithFeatured.asc',
  'score',
];
const noLabels = {};

export default function Sort({
  options = defaultOptions,
  // shown while the form holds no sort; the first option when it is not one
  defaultValue = undefined,
  // per-value label overrides, e.g. the admin names
  // `lastTimingWithFeatured.asc` after the public view
  labels = noLabels,
  // per-value labels for the closed select only, where room is short; the
  // label otherwise
  shortLabels = noLabels,
  // per-value detail lines shown under each label in the open menu, over the
  // defaults; `false` shows labels only
  descriptions = noLabels,
  // merged over the default styles, key by key
  styles = null,
  // accessible name of the select, a translated "Sort by" by default; `false`
  // when the page names it with its own <label>
  label = undefined,
  ...rest
}) {
  const intl = useIntl();
  const form = useForm();

  const mergedStyles = useMemo(
    () => (styles ? { ...stateSelectStyles, ...styles } : stateSelectStyles),
    [styles],
  );

  const [userSort, setUserSort] = useState(() => form.getState().values.sort);

  const { values } = useFormState({ subscription: { values: true } });
  const hasSearch = Boolean(values.search?.length);
  const hasRelevance = options.includes('score');

  const orderOptions = useMemo(
    () =>
      // listed in the order of `options`; values without a label are dropped
      options
        .filter((value) => optionMessages[value])
        .map((value) => ({
          value,
          label: labels[value] ?? intl.formatMessage(optionMessages[value]),
        }))
        // relevance only ranks against a search
        .filter(({ value }) => value !== 'score' || hasSearch),
    [hasSearch, intl, labels, options],
  );

  // never show a default the select does not offer
  const shownDefault = orderOptions.some(({ value }) => value === defaultValue)
    ? defaultValue
    : orderOptions[0]?.value;

  // a sort loaded from the page query may be a known order the select does
  // not offer: name it rather than showing its raw value
  const formatOptionLabel = useCallback(
    ({ value, label: rawLabel }, { context }) => {
      // in the closed select: the integration's short label, then its
      // label, then ours; in the menu: the integration's label, then ours
      const defaultMessage = (context === 'value' ? shortMessages[value] : undefined)
        ?? optionMessages[value];
      const name = (context === 'value' ? shortLabels[value] : undefined)
        ?? labels[value]
        ?? (defaultMessage ? intl.formatMessage(defaultMessage) : rawLabel);

      const description = context === 'menu' && descriptions !== false
        ? (descriptions[value]
            ?? (descriptionMessages[value]
              ? intl.formatMessage(descriptionMessages[value])
              : null))
        : null;

      if (!description) {
        return name;
      }

      return (
        <span className="oa-filters-sort-option">
          <span className="oa-filters-sort-label">{name}</span>
          <span className="oa-filters-sort-description">{description}</span>
        </span>
      );
    },
    [descriptions, intl, labels, shortLabels],
  );

  return (
    <>
      <ReactSelectField
        Field={Field}
        name="sort"
        options={orderOptions}
        styles={mergedStyles}
        isSearchable={false}
        isClearable={false}
        defaultValue={shownDefault}
        formatOptionLabel={formatOptionLabel}
        aria-label={
          label === false
            ? undefined
            : (label ?? intl.formatMessage(messages.sortBy))
        }
        {...rest}
      />
      <OnChange name="sort">
        {(value) => {
          // user change
          if (form.getState().active === 'sort') {
            setUserSort(value);
          }
        }}
      </OnChange>
      <OnChange name="search">
        {(value, previousValue) => {
          const { sort } = form.getState().values;

          if (!hasRelevance) {
            return;
          }

          // an untouched search field is undefined rather than ''
          if (!previousValue && value) {
            // search added
            setUserSort(sort);
            form.change('sort', 'score');
          } else if (sort === 'score' && previousValue && !value) {
            // search removed
            form.change(
              'sort',
              userSort && userSort !== '' ? userSort : undefined,
            );
          }
        }}
      </OnChange>
    </>
  );
}
