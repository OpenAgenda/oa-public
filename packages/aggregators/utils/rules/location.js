function _matches(filter, values, field) {
  return [].concat(filter[field]).includes(values[field]);
}

export default (evaluatedLocation, filter) =>
  []
    .concat(filter)
    .map((locationFilter) => {
      const evaluatedLocationFields = Object.keys(locationFilter);

      const matchingFields = evaluatedLocationFields.filter(
        _matches.bind(null, locationFilter, evaluatedLocation),
      );

      return matchingFields.length === evaluatedLocationFields.length;
    })
    .filter((matching) => !!matching).length;
