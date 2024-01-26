"use strict";

const svc = require( '../../service' );
const path = require( 'path' );
const fixtures = require( '@openagenda/fixtures' );

module.exports = {
  ...svc,
  initAndLoad
};

function initAndLoad( config, files, options, cb ) {

  if ( arguments.length === 2 ) {
    cb = files;
    options = { reset: true };
    files = [
      'invitation'
    ];
  } else if ( arguments.length === 3 ) {
    cb = options;
    options = { reset: true };
  }

  svc.init( config, err => {

    if ( err ) return cb( err );

    fix( config, files, options, cb );

  } );

}

function fix( config, files, options, cb ) {

  fixtures.init( { mysql: config.mysql } );

  fixtures( [ {
    table: config.schemas.invitation,
    src: path.dirname( __dirname ) + '/fixtures/invitation.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), options, cb );

}
