"use strict";

const _ = require( 'lodash' );

module.exports = ( evaluatedLocation, filter ) => {

  return [].concat( filter ).map( locationFilter => {

    const evaluatedLocationFields = _.keys( locationFilter );

    const matchingFields = evaluatedLocationFields.filter( locationField => evaluatedLocation[ locationField ] === locationFilter[ locationField ] );

    return matchingFields.length === evaluatedLocationFields.length;

  } ).filter( matching => !!matching ).length;

}
