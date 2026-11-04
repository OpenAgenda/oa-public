import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { Field, useField, useForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { components as selectComponents } from 'react-select';
import ReactSelectField from '@openagenda/react-shared/components/ReactSelectField';
import AppliedValuesContext from '../contexts/AppliedValuesContext.js';
import messages from '../messages/sort.js';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectField;

const stateSelectStyles = {
  ...defaultReactSelectStyles,
  container: (provided) => ({
    ...provided,
    display: 'inline-block',
    minWidth: '180px',
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

// Lays every label the closed select can show, invisible, in the cell of the
// value: the select is as wide as the widest of them, whichever is selected
// and whether a search offers relevance or not.
function ValueContainer({ children, ...props }) {
  return (
    <selectComponents.ValueContainer {...props}>
      {children}
      {props.selectProps.sizingLabels?.map((sizingLabel) => (
        <span
          key={sizingLabel}
          aria-hidden
          style={{
            gridArea: '1 / 1 / 2 / 3',
            height: 0,
            margin: '0 2px',
            overflow: 'hidden',
            visibility: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {sizingLabel}
        </span>
      ))}
    </selectComponents.ValueContainer>
  );
}

// shown with nothing to offer; without its id, which react-select points
// `aria-describedby` at: the select's name already says "Sort by"
function Placeholder({ innerProps, ...props }) {
  return (
    <selectComponents.Placeholder
      {...props}
      innerProps={{ ...innerProps, id: undefined }}
    />
  );
}

const selectComponentsOverrides = { ValueContainer, Placeholder };

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
  // merged over the component that sizes the select
  components = undefined,
  // as wide as the longest label it can show, whichever is selected; `false`
  // lets the select follow the selected label, e.g. styled as a link
  sizeToLabels = true,
  ...rest
}) {
  const intl = useIntl();
  const form = useForm();

  const mergedComponents = useMemo(() => {
    const own = sizeToLabels
      ? selectComponentsOverrides
      : { Placeholder: selectComponentsOverrides.Placeholder };

    return components ? { ...own, ...components } : own;
  }, [components, sizeToLabels]);

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

  // A sort the select does not offer, from the page's URL, is shown under
  // its label: it joins the sizing for good, so that picking an offered order
  // afterwards does not narrow the select.
  const {
    input: { value: shownSort },
  } = useField('sort', { subscription: { value: true } });
  const [foreignSorts, setForeignSorts] = useState(() => {
    const initialSort = form.getState().values.sort;
    return initialSort && !options.includes(initialSort) ? [initialSort] : [];
  });

  useEffect(() => {
    if (
      shownSort
      && !options.includes(shownSort)
      && !foreignSorts.includes(shownSort)
    ) {
      setForeignSorts((previous) => [...previous, shownSort]);
    }
  }, [foreignSorts, options, shownSort]);

  // relevance included: the width must not change when a search adds it
  const sizingLabels = useMemo(
    () => [
      ...new Set([
        ...options
          .filter((value) => optionMessages[value])
          .map((value) => formatOptionLabel({ value }, { context: 'value' })),
        ...foreignSorts.map((value) =>
          formatOptionLabel({ value, label: value }, { context: 'value' })),
      ]),
    ],
    [foreignSorts, formatOptionLabel, options],
  );

  const userSortRef = useRef(userSort);
  userSortRef.current = userSort;

  // With manual submit, what gets applied never ranks by relevance without a
  // search, whichever way the search went (the field, a badge): the order
  // applied before relevance comes back. The form alone cannot tell, since
  // manual submit never resets it.
  const applied = useContext(AppliedValuesContext);
  const appliedRef = useRef(applied);
  appliedRef.current = applied;
  const appliedSortBeforeRelevanceRef = useRef(userSort);
  const appliedSort = applied?.values.sort;

  useEffect(() => {
    if (appliedSort !== 'score') {
      appliedSortBeforeRelevanceRef.current = appliedSort;
    }
  }, [appliedSort]);

  const registerRule = applied?.registerRule;

  useEffect(
    () =>
      registerRule?.((values) =>
        (!values.search && values.sort === 'score'
          ? { ...values, sort: appliedSortBeforeRelevanceRef.current }
          : values)),
    [registerRule],
  );
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

        if (
          !hasRelevanceRef.current
          || !dirty
          || wasSet === isSet
          // the provider realigns the form on applied values, rules included
          || appliedRef.current?.isApplying()
        ) {
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
      <ReactSelectField
        Field={Field}
        name="sort"
        options={orderOptions}
        styles={mergedStyles}
        isSearchable={false}
        isClearable={false}
        defaultValue={shownDefault}
        formatOptionLabel={formatOptionLabel}
        components={mergedComponents}
        sizingLabels={sizingLabels}
        // with nothing to offer, the select stays in place, named and idle
        placeholder={intl.formatMessage(messages.sortBy)}
        aria-label={
          label === false
            ? undefined
            : (label ?? intl.formatMessage(messages.sortBy))
        }
        {...rest}
        isDisabled={rest.isDisabled || !orderOptions.length}
      />
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
