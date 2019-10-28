"use strict";

const _ = require( 'lodash' );

module.exports = (evaluatedLocation, filter) => {
  return [].concat(filter).map(locationFilter => {
    const evaluatedLocationFields = Object.keys(locationFilter);

    const matchingFields = evaluatedLocationFields.filter(_matches.bind(null, locationFilter, evaluatedLocation));

    return matchingFields.length === evaluatedLocationFields.length;
  }).filter(matching => !!matching).length;
}

function _matches(filter, values, field, index) {
  return [].concat(filter[field]).includes(values[field]);
}
