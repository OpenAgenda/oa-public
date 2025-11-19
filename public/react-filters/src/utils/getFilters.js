import dateRanges from './dateRanges.js';
import withDefaultFilterConfig from './withDefaultFilterConfig.js';
import getAdditionalFilters from './getAdditionalFilters.js';

const isNameMatching = (name1, name2) =>
  name1.replace('.', ':') === name2.replace('.', ':');

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
    { name: 'valid' },
  ];

  const defaultSortFilters = standardFilters
    .concat(getAdditionalFilters(fields))
    .filter(
      (filter) =>
        !exclude || !exclude.find((f) => isNameMatching(f, filter.name)),
    )
    .filter(
      (filter) =>
        !include || !!include.find((f) => isNameMatching(f, filter.name)),
    );

  const finalCompleteSort = sort ?? include ?? [];

  defaultSortFilters.forEach((filter) => {
    if (finalCompleteSort.includes(filter.name)) {
      return;
    }
    finalCompleteSort.push(filter.name);
  });

  return finalCompleteSort
    .map((filterName) => {
      const match = defaultSortFilters.find((filter) =>
        isNameMatching(filter.name, filterName));

      if (!match) {
        console.warn(
          'filter %s did not match any known field or filter',
          filterName,
        );
      }

      return match;
    })
    .filter((f) => !!f)
    .map((filter) =>
      withDefaultFilterConfig(filter, intl, {
        dateFnsLocale: opts.dateFnsLocale,
        mapTiles: opts.mapTiles,
        missingValue: opts.missingValue,
      }));
}
