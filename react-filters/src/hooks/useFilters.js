import { createRef, useMemo } from 'react';
import { useUIDSeed } from 'react-uid';
import { withDefaultFilterConfig, dateRanges } from '../utils';

export default function useFilters(intl, agendaSchema, opts = {}) {
  const seed = useUIDSeed();

  return useMemo(() => {
    const { staticRanges, inputRanges } = dateRanges(intl);

    const standardFilters = [
      { name: 'viewport' },
      { name: 'geo' },
      { name: 'addMethod' },
      { name: 'memberUid' },
      { name: 'locationUid' },
      { name: 'sourceAgendaUid' },
      { name: 'originAgendaUid' },
      { name: 'featured' },
      { name: 'relative' },
      { name: 'timings', staticRanges, inputRanges },
      { name: 'createdAt', staticRanges, inputRanges },
      { name: 'updatedAt', staticRanges, inputRanges },
      { name: 'state' },
      { name: 'attendanceMode' },
      { name: 'region' },
      { name: 'department' },
      { name: 'city' },
      { name: 'adminLevel3' },
      { name: 'keyword' },
      { name: 'status' },
      { name: 'district' },
      { name: 'accessibility' }
    ];

    const additionalFilters = agendaSchema.fields
      .filter(fieldSchema => ['checkbox', 'radio', 'multiselect', 'boolean'].includes(fieldSchema.fieldType))
      .map(fieldSchema => ({
        name: fieldSchema.field,
        fieldSchema
      }));

    return standardFilters
      .concat(additionalFilters)
      .map(filter => withDefaultFilterConfig(filter, intl, {
        mapTiles: opts.mapTiles,
        missingValue: opts.missingValue
      }))
      .map(filter => ({
        ...filter,
        id: seed(filter),
        elemRef: createRef(),
      }));
  }, [
    intl,
    agendaSchema.fields,
    seed,
  ]);
}
