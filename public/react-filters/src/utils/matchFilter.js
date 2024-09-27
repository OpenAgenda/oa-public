import { formatValue as formatDateRangeValue } from '../components/filters/DateRangeFilter';
import matchQuery from './matchQuery';

export default function matchFilter(filter, values, entry) {
  const [key, value] = entry;

  // Matching custom
  if (filter.type === 'custom' && filter.activeFilterLabel) {
    return key in filter.query && matchQuery(values, filter.query);
  }

  // Matching favorites
  if (filter.type === 'favorites' && filter.activeFilterLabel) {
    return !!values.favorites;
  }

  // Matching staticRanges
  if (filter.type === 'definedRange' && filter.name === key) {
    const formattedValue = formatDateRangeValue(value)[0];
    return !!filter.staticRanges.find((v) => v.isSelected(formattedValue));
  }

  // Same name
  return filter.name === key;
}
