"use strict";

const path = require( 'path' );
const _ = require( 'lodash' );
const fixtures = require( '@openagenda/fixtures' );
const svc = require( '../..' );


module.exports = _.extend( svc, {
  initAndLoad,
  populate
} );

async function initAndLoad( config, files, options ) {

  const defautFiles = [
    'user',
    'key',
    'user_token'
  ];

  if ( arguments.length === 2 && Array.isArray( arguments[ 1 ] ) ) {

    options = { reset: true };

  } else if ( arguments.length === 2 ) {

    options = files;

    files = defautFiles;

  } else if ( arguments.length === 1 ) {

    options = { reset: true };

    files = defautFiles;

  }

  const params = Object.assign( {
    reset: true
  }, options );

  await svc.init( config );

  await populate( config, files, params );

}

async function populate( config, files, options ) {

  return new Promise( ( resolve, reject ) => {

    fixtures.init( { mysql: config.mysql } );

    fixtures( [ {
      table: config.schemas.user,
      src: path.dirname( __dirname ) + '/fixtures/user.data.sql'
    }, {
      table: config.schemas.apiKeySet,
      src: path.dirname( __dirname ) + '/fixtures/api_key_set.data.sql'
    }, {
      table: config.schemas.key,
      src: path.dirname( __dirname ) + '/fixtures/key.data.sql'
    }, {
      table: config.schemas.userToken,
      src: path.dirname( __dirname ) + '/fixtures/user_token.data.sql'
    } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), options, err => {

      if ( err ) return reject( err );
      resolve();

    } );

  } );

}
