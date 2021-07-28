const React = require('react');
const {
  Filters,
  DateRangeFilter,
  MultiChoiceFilter,
  MapFilter,
  CustomFilter,
  ValueBadge,
  useFilterTitle,
} = require('@openagenda/react-filters');

const { createElement: el, useMemo } = React;

function BadgePreview({
  name, filter, label, onRemove, disabled, className
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  return el(
    'span',
    {
      className,
      title
    },
    el(
      ValueBadge,
      {
        label,
        onRemove,
        disabled
      }
    )
  );
}

function MultiChoicePreview({
  name,
  filter,
  valueOptions,
  onRemove,
  disabled,
  className,
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  if (!valueOptions?.length) {
    return null;
  }

  return el(
    'span',
    {
      className,
      title
    },
    ...valueOptions.map(option => el(
      ValueBadge,
      {
        key: option.value,
        label: option.label,
        onRemove: onRemove(option),
        disabled,
      }
    ))
  );
}

function DateRangePreviewer(props) {
  return el(DateRangeFilter.Preview, { component: BadgePreview, ...props });
}

function MultiChoicePreviewer(props) {
  return el(MultiChoiceFilter.Preview, { component: MultiChoicePreview, ...props });
}

function MapPreviewer(props) {
  return el(MapFilter.Preview, { component: BadgePreview, ...props });
}

function CustomPreviewer(props) {
  return el(CustomFilter.Preview, { component: BadgePreview, ...props });
}

module.exports = function FiltersPreview({ filters, getOptions }) {
  const filtersWithoutDest = useMemo(() => filters.map(v => {
    const { destSelector, destContainer, ...filter } = v;
    return filter;
  }), [filters]);

  return el(
    Filters,
    {
      filters: filtersWithoutDest,
      // disabled: isFetching || filtersQuery.isFetching,
      dateRangeComponent: DateRangePreviewer,
      checkboxComponent: MultiChoicePreviewer,
      radioComponent: MultiChoicePreviewer,
      mapComponent: MapPreviewer,
      customComponent: CustomPreviewer,
      // getTotal,
      getOptions,
    }
  );
};
