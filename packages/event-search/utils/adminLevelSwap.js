const map = [
  { al: 'adminLevel1', to: 'region' },
  { al: 'adminLevel2', to: 'department' },
  { al: 'adminLevel4', to: 'city' },
  { al: 'adminLevel5', to: 'adminLevel5' },
  { al: 'adminLevel6', to: 'district' },
  { al: 'adminLevel3', to: 'adminLevel3' },
];

export default {
  map,
  apply: (arr) =>
    arr.map((a) => {
      const found = map.find((m) => `location.${m.al}` === a);
      return found ? `location.${found.to}` : a;
    }),
  reverse: (fieldName) => {
    const found = map.find((m) => `location.${m.to}` === fieldName);
    return found ? `location.${found.al}` : fieldName;
  },
  transformToRequested: ({ requestedIncludes, useAdminLevels }, event) => {
    if (!event?.location || (!requestedIncludes && useAdminLevels === null)) {
      return event;
    }

    const requestedLocationIncludes = requestedIncludes
      ? requestedIncludes
        .filter((k) => k.indexOf('location') === 0)
        .map((k) => k.split('.').pop())
      : undefined;

    if (requestedIncludes && !requestedLocationIncludes.length) {
      return {
        ...event,
        location: undefined,
      };
    }

    const includeAllLocationFields = (requestedLocationIncludes ?? []).includes(
      'location',
    );

    if (requestedLocationIncludes && !includeAllLocationFields) {
      return {
        ...event,
        location: map.reduce(
          (acc, m) => {
            if (requestedLocationIncludes.includes(m.al)) {
              acc[m.al] = event.location[m.to];
            }
            return acc;
          },
          requestedLocationIncludes.reduce(
            (l, requestedIncludeKey) => ({
              ...l,
              ...event.location[requestedIncludeKey] !== undefined
                ? {
                  [requestedIncludeKey]: event.location[requestedIncludeKey],
                }
                : undefined,
            }),
            {},
          ),
        ),
      };
    }

    const adminLevelableKeys = map.reduce(
      (allKeys, item) => allKeys.concat([item.al, item.to]),
      [],
    );

    if (useAdminLevels !== null) {
      return {
        ...event,
        location: map.reduce(
          (location, { al, to }) => ({
            ...location,
            [useAdminLevels ? al : to]: event.location[to],
          }),
          Object.keys(event.location)
            .filter((k) => !adminLevelableKeys.includes(k))
            .reduce(
              (adminLevellesLocation, key) => ({
                ...adminLevellesLocation,
                [key]: event.location[key],
              }),
              {},
            ),
        ),
      };
    }

    return event;
  },
};
