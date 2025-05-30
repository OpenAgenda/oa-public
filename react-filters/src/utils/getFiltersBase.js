import withDefaultFilterConfig from './withDefaultFilterConfig.js';

export default function getFiltersBase(fields, opts = {}) {
  return [
    { name: 'memberUid' },
    { name: 'locationUid' },
    { name: 'sourceAgendaUid' },
    { name: 'originAgendaUid' },
    { name: 'country' },
    { name: 'region' },
    { name: 'department' },
    { name: 'city' },
    { name: 'adminLevel3' },
    { name: 'district' },
    { name: 'keyword' },
  ]
    .filter((filter) => !opts.exclude?.includes(filter.name))
    .map((filter) =>
      withDefaultFilterConfig(filter, null, {
        dateFnsLocale: opts.dateFnsLocale,
        mapTiles: opts.mapTiles,
        missingValue: opts.missingValue,
      }));
}
