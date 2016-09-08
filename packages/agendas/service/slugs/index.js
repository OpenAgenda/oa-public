"use strict";

const utils = require( 'utils' );

let validateSlug = require( './validator' )(),

  schemas,

  knex;

module.exports = {
  init: ( s, k ) => { schemas = s; knex = k; },
  isTaken,
  generate: require( './generate' )
}


function isTaken( slug, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  let params = utils.extend( {
    excludeUid: false
  }, options ),

    cleanSlug = null,

    errors = [];

  if ( !knex ) {

    return cb( 'service was not initialized' );

  }

  try {

    cleanSlug = validateSlug( slug );

  } catch( e ) {

    errors = e;

  }

  if ( errors.length ) {

    return cb( null, {
      taken: null,
      valid: false,
      errors: errors
    } );

  }

  // look up in db
  
  let knexQuery = knex( schemas.agenda )

  .select( 'id' )

  .where( { slug: cleanSlug } );

  if ( params.excludeUid ) {

    knexQuery.andWhereNot( {
      uid: params.excludeUid
    } )

  };

  knexQuery.then( rows => {

    cb( null, {
      taken: !!rows.length,
      valid: true,
      errors: []
    } );

  }, cb );

}