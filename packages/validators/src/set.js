import utils from '@openagenda/utils'

export default ( validators, options ) => {

  validate.type = 'set';

  var params = utils.extend( {
    compact: false
  }, options || {} );

  return validate;

  function validate( valuesSet ) {

    var errors = [], clean = [], compacted = {};

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

    if ( params.compact ) {

      clean.forEach( function( c ) {

        compacted[ c.field ] = c.value;

      } );

      return compacted;

    }

    return clean;

  }

}
