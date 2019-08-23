"use strict";

process.env.NODE_ENV = 'test';

const svc = require( '../../' ),

_ = require( 'lodash' ),

fixtures = require( '@openagenda/fixtures' );

module.exports = svc;

module.exports.initAndLoad = function( config, files, options, cb ) {

  const defaultFiles = [
    'agenda_event'
  ];

  if ( arguments.length === 3 ) {

    cb = options;

    options = files;

    files = defaultFiles;

  } else if ( arguments.length === 2 ) {

    cb = files;

    options = { reset: true };

    files = defaultFiles;

  }

  svc.init( config )

  fixtures.init( { mysql: config.mysql } );

  if ( files.length && !_.difference( Object.keys( files[ 0 ] ), [ 'table', 'src' ] ).length ) {

    return fixtures( files, options, cb );

  }

  let fx = [ {
    table: 'agenda_event',
    src: __dirname + '/agenda_event.data.sql'
  }, {
    key: 'agenda_event_empty',
    table: 'agenda_event',
    src: __dirname + '/agenda_event_empty.data.sql'
  }, {
    table: 'legacy_agenda_event',
    src: __dirname + '/legacy_agenda_event.data.sql'
  }, {
    table: 'legacy_event_editor',
    src: __dirname + '/legacy_event_editor.data.sql'
  }, {
    table: 'legacy_agenda',
    src: __dirname + '/legacy_agenda.data.sql'
  }, {
    table: 'legacy_event',
    src: __dirname + '/legacy_event.data.sql'
  }, {
    table: 'legacy_user',
    src: __dirname + '/legacy_user.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) );

  fixtures( fx, options, cb );

}
