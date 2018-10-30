"use strict";

const _ = require( 'lodash' );

const fixtures = require( '@openagenda/fixtures' );

const svc = require( '../../' );

module.exports = svc;

module.exports.initAndLoad = function( config, files, options, cb ) {

  const defaultFiles = [
    'event'
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

  svc.init( config );

  fixtures.init( { mysql: config.mysql } );

  if ( files.length && !_.difference( Object.keys( files[ 0 ] ), [ 'table', 'src' ] ).length ) {

    return fixtures( files, options, cb );

  }

  fixtures( [ {
    table: 'event',
    src: __dirname + '/event.data.sql'
  }, {
    key: 'event_empty',
    table: 'event',
    src: __dirname + '/event_empty.data.sql'
  }, {
    key: 'event_few',
    table: 'event',
    src: __dirname + '/event_few.data.sql'
  }, {
    table: 'legacy_event',
    src: __dirname + '/legacy_event.data.sql'
  }, {
    key: 'legacy_event_few',
    table: 'legacy_event',
    src: __dirname + '/legacy_event_few.data.sql'
  }, {
    table: 'legacy_event_translation',
    src: __dirname + '/legacy_event_translation.data.sql'
  }, {
    table: 'legacy_occurrence',
    src: __dirname + '/legacy_occurrence.data.sql'
  }, {
    table: 'legacy_event_location',
    src: __dirname + '/legacy_event_location.data.sql'
  }, {
    table: 'legacy_event_location_translation',
    src: __dirname + '/legacy_event_location_translation.data.sql'
  }, {
    table: 'legacy_user',
    src: __dirname + '/legacy_user.data.sql'
  }, {
    table: 'legacy_agenda_event',
    src: __dirname + '/legacy_agenda_event.data.sql'
  }, {
    table: 'legacy_agenda_event_references',
    src: __dirname + '/legacy_agenda_event_references.data.sql'
  }, {
    table: 'legacy_location',
    src: __dirname + '/legacy_location.data.sql'
  }, {
    table: 'legacy_agenda',
    src: __dirname + '/legacy_agenda.data.sql'
  }, {
    table: 'legacy_deleted',
    src: __dirname + '/legacy_deleted.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), options, cb );

}
