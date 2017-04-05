"use strict";

// proxy function for service in a test env. Init does service init as well as fixture loading.

const svc = require( '../../' );
const fixtures = require( './fixtures' );

module.exports = svc;

module.exports.initAndLoad = function ( config, files, options, cb ) {

  const defautFiles = [
    'activity',
    'feed',
    'feed_activity',
    'feed_follow',
    'feed_notification'
  ];

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

  svc.init( config, err => {

    if ( err ) return cb( err );

    fixtures( config, files, options, cb );

  } );

}