"use strict";

var utils = require( 'utils' );

var validateSlug = require( './validator' )(),

  schemas,

  knex;

module.exports = {
  init: function( s, k ) { schemas = s; knex = k; },
  isTaken: isTaken,
  generate: require( './generate' )
}


function isTaken( slug, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  var params = utils.extend( {
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
  
  var knexQuery = knex( schemas.agenda )

  .select( 'id' )

  .where( { slug: cleanSlug } );

  if ( params.excludeUid ) {

    knexQuery.andWhereNot( {
      uid: params.excludeUid
    } )

  };

  knexQuery.then( function( rows ) {

    cb( null, {
      taken: !!rows.length,
      valid: true,
      errors: []
    } );

  }, cb );

}