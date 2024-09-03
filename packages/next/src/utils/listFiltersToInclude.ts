import { getAdditionalFilters } from '@openagenda/react-filters';

export default function listFiltersToInclude(agenda) {
  if (agenda.settings?.public?.filters?.displayed) {
    return ['search', 'geo'].concat(
      agenda.settings.public.filters.displayed.filter(
        name => !['search', 'geo'].includes(name),
      ),
    );
  }

  const additionalFilters = getAdditionalFilters(agenda.schema.fields).map(
    ({ fieldSchema }) => fieldSchema.field,
  );

  return ['search', 'geo', 'timings', ...additionalFilters];
}
