import { getAdditionalFilters } from '@openagenda/react-filters';

export default function listFiltersToInclude(agenda) {
  const displayedFilters = agenda?.settings?.public?.filters?.displayed;

  if (displayedFilters) {
    const defaultFilters = ['search', 'geo'];
    return [
      ...defaultFilters,
      ...displayedFilters.filter((name) => !defaultFilters.includes(name)),
    ];
  }

  const additionalFilters = getAdditionalFilters(agenda.schema.fields).map(
    ({ fieldSchema }) => fieldSchema.field,
  );

  return ['search', 'geo', 'timings', ...additionalFilters];
}
