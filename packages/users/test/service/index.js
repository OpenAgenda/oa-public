"use strict";

const path = require( 'path' );
const _ = require( 'lodash' );
const fixtures = require( 'fixtures' );
const svc = require( '../..' );

module.exports = _.extend( svc, {
  initAndLoad
} );

function initAndLoad( config, files, options, cb ) {

  const defautFiles = [
    'user',
    'api_key_set'
  ]

  if ( arguments.length === 3 && Array.isArray( arguments[ 1 ] ) ) {

    cb = options;

    options = { reset: true };

  } else if ( arguments.length === 3 ) {

    cb = options;

    options = files;

    files = defautFiles;

  } else if ( arguments.length === 2 ) {

    cb = files;

    options = { reset: true };

    files = defautFiles;

  }

  const params = Object.assign( {
    reset: true
  }, options );

  svc.init( config, err => {

    if ( err ) return cb( err );

    fix( config, files, params, cb );

  } );

}

function fix( config, files, options, cb ) {

  fixtures.init( { mysql: config.mysql } );

  fixtures( [ {
    table: config.schemas.user,
    src: path.dirname( __dirname ) + '/fixtures/user.data.sql'
  }, {
    table: config.schemas.apiKeySet,
    src: path.dirname( __dirname ) + '/fixtures/api_key_set.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), options, cb );

}
