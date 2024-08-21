import { getAdditionalFilters } from '@openagenda/react-filters';

export default function listFiltersToInclude(agenda) {
  if (agenda.settings?.public?.filters?.displayed) {
    return agenda.settings.public.filters.displayed;
  }

  const additionalFilters = getAdditionalFilters(agenda.schema.fields).map(
    ({ fieldSchema }) => fieldSchema.field,
  );

  return ['search', 'geo', 'timings', ...additionalFilters];
}
