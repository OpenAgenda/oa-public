"use strict";

module.exports = function( validators ) {

  return function( valuesSet ) {

    var errors = [], clean = [];

    validators.forEach( function( validator ) {

      var matchingValue = valuesSet.filter( function( v ) {

        return v.field === validator.field;

      } );

      matchingValue = matchingValue.length ? matchingValue[ 0 ] : { field: validator.field, value: undefined }

      try {

        clean.push( {
          field: matchingValue.field,
          value: validator( matchingValue.value )
        } );

      } catch( e ) {

        errors = errors.concat( e );

      }

    } );

    if ( errors.length ) {

      throw errors;

    }

    return clean;

  }

}