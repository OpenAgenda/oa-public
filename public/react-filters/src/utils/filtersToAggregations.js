export default function filtersToAggregations(filters, base = false) {
  const usedFilters = base
    ? filters.filter(filter => filter.type === 'choice' && !filter.options)
    : filters;

  const aggregations = usedFilters
    .map(filter => {
      if (filter.aggregation === null) {
        return false;
      }

      return {
        key: filter.name,
        type: filter.name,
        missing: filter.missingValue ? 'null' : undefined,
        ...filter.aggregation,
      };
    })
    .filter(Boolean);

  const needViewport = usedFilters.some(filter => filter.type === 'map');

  if (needViewport) {
    aggregations.unshift({
      key: 'viewport',
      type: 'viewport'
    });
  }

  return aggregations;
}
