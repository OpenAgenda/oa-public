import dateRanges from './dateRanges';
import withDefaultFilterConfig from './withDefaultFilterConfig';
import getAdditionalFilters from './getAdditionalFilters';

export default function getFilters(intl, fields, opts = {}) {
  const { staticRanges, inputRanges } = dateRanges(intl, opts);

  const { include, sort, exclude } = opts;

  const standardFilters = [
    { name: 'viewport' },
    { name: 'geo' },
    { name: 'search' },
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
    { name: 'countryCode' },
    { name: 'region' },
    { name: 'department' },
    { name: 'adminLevel3' },
    { name: 'city' },
    { name: 'district' },
    { name: 'keyword' },
    { name: 'status' },
    { name: 'accessibility' },
  ];

  const defaultSortFilters = standardFilters
    .concat(getAdditionalFilters(fields))
    .filter(filter => !exclude || !exclude.includes(filter.name))
    .filter(filter => !include || include.includes(filter.name));

  const finalCompleteSort = sort ?? include ?? [];

  defaultSortFilters.forEach(filter => {
    if (finalCompleteSort.includes(filter.name)) {
      return;
    }
    finalCompleteSort.push(filter.name);
  });

  return finalCompleteSort
    .map(filterName =>
      defaultSortFilters.find(filter => filter.name === filterName))
    .map(filter =>
      withDefaultFilterConfig(filter, intl, {
        dateFnsLocale: opts.dateFnsLocale,
        mapTiles: opts.mapTiles,
        missingValue: opts.missingValue,
      }));
}
