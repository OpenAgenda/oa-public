const map = [
  { al: 'adminLevel1', to: 'region' },
  { al: 'adminLevel2', to: 'department' },
  { al: 'adminLevel4', to: 'city' },
  { al: 'adminLevel6', to: 'district' },
];

export default {
  map,
  apply: (arr) =>
    arr.map((a) => {
      const found = map.find((m) => `location.${m.al}` === a);
      return found ? `location.${found.to}` : a;
    }),
  transformToRequested: (requestedIncludes, event) => {
    if (!event?.location || !requestedIncludes) {
      return event;
    }

    const requestedLocationIncludes = requestedIncludes
      .filter((k) => k.indexOf('location') === 0)
      .map((k) => k.split('.').pop());

    if (!requestedLocationIncludes.length) {
      return {
        ...event,
        location: undefined,
      };
    }

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
  },
};
