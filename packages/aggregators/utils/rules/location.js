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

export default (evaluatedLocation, filter) =>
  []
    .concat(filter)
    .map((locationFilter) => {
      const evaluatedLocationFields = Object.keys(locationFilter).filter(
        (k) => k !== 'caseSensitive',
      );
      const matchingFields = evaluatedLocationFields.filter(
        _matches.bind(null, locationFilter, evaluatedLocation),
      );
      return matchingFields.length === evaluatedLocationFields.length;
    })
    .filter((matching) => !!matching).length;
