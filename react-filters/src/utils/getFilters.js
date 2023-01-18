import dateRanges from './dateRanges';
import withDefaultFilterConfig from './withDefaultFilterConfig';
import getAdditionalFilters from './getAdditionalFilters';

export default function getFilters(intl, fields, opts = {}) {
  const { staticRanges, inputRanges } = dateRanges(intl, opts);

  const standardFilters = [
    { name: 'viewport' },
    { name: 'geo' },
    { name: 'addMethod' },
    { name: 'memberUid' },
    { name: 'languages' },
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
    { name: 'adminLevel3' },
    { name: 'city' },
    { name: 'district' },
    { name: 'keyword' },
    { name: 'status' },
    { name: 'accessibility' },
  ];

  return standardFilters
    .concat(getAdditionalFilters(fields))
    .filter(filter => opts.include?.includes(filter.name) ?? true)
    .filter(filter => !opts.exclude?.includes(filter.name))
    .map(filter => withDefaultFilterConfig(filter, intl, {
      dateFnsLocale: opts.dateFnsLocale,
      mapTiles: opts.mapTiles,
      missingValue: opts.missingValue,
    }));
}
