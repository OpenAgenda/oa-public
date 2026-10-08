import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Field, useField, useForm } from 'react-final-form';
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

// what a public listing wants, with a single chronological order so the
// closed select never shows two orders under the same short label; the agenda
// admin passes its own
const defaultOptions = ['lastTimingWithFeatured.asc', 'score'];
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

  // the sort to bring back once a search is cleared: never relevance, which
  // only ranks against a search
  const [userSort, setUserSort] = useState(() => {
    const { sort } = form.getState().values;
    return sort === 'score' ? undefined : sort;
  });

  // only the search matters here: subscribing to every value would re-render
  // the select on each change of any filter
  const {
    input: { value: search },
  } = useField('search', { subscription: { value: true } });
  const hasSearch = Boolean(search?.length);
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

  const userSortRef = useRef(userSort);
  userSortRef.current = userSort;
  const hasRelevanceRef = useRef(hasRelevance);
  hasRelevanceRef.current = hasRelevance;

  // Switch to relevance when the visitor types a search, and back when they
  // clear it. A field subscriber runs before the provider's automatic submit
  // resets the form, so `dirty` still tells a typed search from one the form
  // was reset to (back/forward, a link), which comes with its own sort.
  useEffect(() => {
    let previous;

    return form.registerField(
      'search',
      ({ value, dirty }) => {
        const wasSet = Boolean(previous);
        const isSet = Boolean(value);
        previous = value;

        if (!hasRelevanceRef.current || !dirty || wasSet === isSet) {
          return;
        }

        const { sort } = form.getState().values;

        if (isSet) {
          if (sort !== 'score') {
            setUserSort(sort);
          }
          form.change('sort', 'score');
        } else if (sort === 'score') {
          form.change('sort', userSortRef.current || undefined);
        }
      },
      { value: true, dirty: true },
    );
  }, [form]);

  return (
    <>
      {/* a menu with a single choice has nothing to offer: hidden until a
          search adds relevance */}
      {orderOptions.length > 1 ? (
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
      ) : null}
      <OnChange name="sort">
        {(value) => {
          // picked by the visitor or set by the page's URL alike
          if (value !== 'score') {
            setUserSort(value);
          }
        }}
      </OnChange>
    </>
  );
}
