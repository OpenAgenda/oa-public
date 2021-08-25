const React = require('react');
const {
  ActiveFilters,
  DateRangeFilter,
  DefinedRangeFilter,
  ChoiceFilter,
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

function ChoicePreview({
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

function DefinedRangePreviewer(props) {
  return el(DefinedRangeFilter.Preview, { component: BadgePreview, ...props });
}

function ChoicePreviewer(props) {
  return el(ChoiceFilter.Preview, { component: ChoicePreview, ...props });
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
    ActiveFilters,
    {
      filters: filtersWithoutDest,
      // disabled: isFetching || filtersQuery.isFetching,
      dateRangeComponent: DateRangePreviewer,
      definedRangeComponent: DefinedRangePreviewer,
      choiceComponent: ChoicePreviewer,
      mapComponent: MapPreviewer,
      customComponent: CustomPreviewer,
      // getTotal,
      getOptions,
    }
  );
};
