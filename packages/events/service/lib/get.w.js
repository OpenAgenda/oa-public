"use strict";

const w = require( 'when' );

const _ = require( 'lodash' );

module.exports = options => {

  let params = _.extend( {
    log: false,
    get: false,
    clean: false,
    target: 'event',
    internal: false,
    detailed: false,
    prerequisite: () => true
  }, options );

  return v => {

    if ( !params.prerequisite( v ) ) {

      params.log( 'get will not proceed for target %s', params.target );

      return v;

    }

    let d = w.defer();

    params.get( v.id ? { id: v.id } : v.identifiers, {
      internal: params.internal,
      private: null,
      includeImagePath: params.includeImagePath,
      detailed: params.detailed
    }, ( err, data ) => {

      if ( err ) return d.reject( err );

      if ( !data ) return d.reject( 'event not found' );

      params.log( 'retrieved agenda of uid %s', data.uid );

      v.id = data.id;

      v[ params.target ] = data;

      d.resolve( v );

    } );

    return d.promise;

  }

}
