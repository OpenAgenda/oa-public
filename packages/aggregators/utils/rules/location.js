const customToUpper = (str) => {
  if (typeof str !== 'string') return null;
  return str.toUpperCase();
};

function _matches(filter, values, field) {
  return []
    .concat(
      filter.caseSensitive
        ? filter[field]
        : filter[field].map((f) => customToUpper(f)),
    )
    .includes(
      filter.caseSensitive ? values[field] : customToUpper(values[field]),
    );
}

export default (evaluatedLocation, filter, attendanceMode) => {
  const results = []
    .concat(filter)
    .map((locationFilter) => {
      // Check allowOnlineEvent setting for online events (attendanceMode 2 or 3)
      const allowOnlineEvent = Array.isArray(locationFilter.allowOnlineEvent)
        ? locationFilter.allowOnlineEvent[0]
        : locationFilter.allowOnlineEvent;

      const isOnlineEvent = attendanceMode === 2 || attendanceMode === 3;

      if (isOnlineEvent && allowOnlineEvent) {
        if (allowOnlineEvent === 'all') {
          return true; // Allow all online events to bypass location requirements
        }

        if (allowOnlineEvent === 'strictOrWithMatchingLocation') {
          // Allow online events only if no location data OR location matches
          if (!evaluatedLocation) {
            return true; // No location data - allow to pass
          }

          // Has location data - check if it matches the query
          const evaluatedLocationFields = Object.keys(locationFilter).filter(
            (k) => !['caseSensitive', 'allowOnlineEvent'].includes(k),
          );
          const matchingFields = evaluatedLocationFields.filter(
            _matches.bind(null, locationFilter, evaluatedLocation),
          );
          return matchingFields.length === evaluatedLocationFields.length;
        }
      }

      // Standard location filtering for non-online events or when allowOnlineEvent is false
      if (!evaluatedLocation) {
        return false;
      }

      const evaluatedLocationFields = Object.keys(locationFilter).filter(
        (k) => !['caseSensitive', 'allowOnlineEvent'].includes(k),
      );
      const matchingFields = evaluatedLocationFields.filter(
        _matches.bind(null, locationFilter, evaluatedLocation),
      );
      return matchingFields.length === evaluatedLocationFields.length;
    })
    .filter((matching) => !!matching);

  return results.length;
};
