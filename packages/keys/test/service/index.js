"use strict";

// proxy function for service in a test env. Init does service init as well as fixture loading.

const svc = require( '../../' );
const fixtures = require( 'fixtures' );

module.exports = svc;

module.exports.initAndLoad = function ( config, files, options ) {

  const defautFiles = [
    'key'
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

  fixtures.init( { mysql: config.mysql } );

  // reset before migrations if needed
  return new Promise( ( resolve, reject ) => {

    fixtures( [], { reset: params.reset }, async err => {

      if ( err ) {

        console.log( err );
        return reject( err );

      }

      try {

        await svc.init( config );

        fixtures( [ {
          table: config.schemas.key,
          src: __dirname + '/key.data.sql'
        } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), { reset: false }, err => {

          if ( err ) return reject( err );
          resolve();

        } );

      } catch ( e ) {

        console.log( e );
        throw e;

      }

    } );

  } );

};