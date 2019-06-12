"use strict";

const svc = require( '../../' ),

  fixtures = require( '@openagenda/fixtures' ),

  _ = require( 'lodash' );

module.exports = _.extend( svc, {
  initAndLoad
} );

function initAndLoad( config, files, options, cb ) {

  const defaultFiles = [
    'form_schema'
  ];

  if ( arguments.length === 3 ) {
    cb = options;
    options = { reset: true };
  } else if ( arguments.length === 2 ) {
    cb = files;
    options = { reset: true };
    files = defaultFiles;
  }

  svc.init( config );

  fixtures.init( { mysql: config.mysql } );

  if ( files.length && !_.difference( Object.keys( files[ 0 ] ), [
    'table', 'src'
  ] ).length ) {

    return fixtures( files, options, cb );

  }

  fixtures( [ {
    table: 'form_schema',
    src: __dirname + '/form_schema.data.sql'
  }, {
    table: 'network',
    src: __dirname + '/network.data.sql'
  }, {
    table: 'legacy_tag_set',
    src: __dirname + '/legacy_tag_set.data.sql'
  }, {
    table: 'legacy_category_set',
    src: __dirname + '/legacy_category_set.data.sql'
  }, {
    table: 'legacy_agenda',
    src: __dirname + '/legacy_agenda.data.sql'
  }, {
    table: 'legacy_event',
    src: __dirname + '/legacy_event.data.sql'
  }, {
    key: 'legacy_event_few',
    table: 'legacy_event',
    src: __dirname + '/legacy_event_few.data.sql'
  }, {
    table: 'legacy_agenda_event',
    src: __dirname + '/legacy_agenda_event.data.sql',
  }, {
    key: 'legacy_agenda_event_few',
    table: 'legacy_agenda_event',
    src: __dirname + '/legacy_agenda_event_few.data.sql',
  }, {
    key: 'legacy_agenda_tag_few',
    table: 'legacy_agenda_tag',
    src: __dirname + '/legacy_agenda_tag_few.data.sql'
  }, {
    table: 'legacy_agenda_event_tag',
    src: __dirname + '/legacy_agenda_event_tag.data.sql'
  }, {
    key: 'legacy_agenda_event_tag_few',
    table: 'legacy_agenda_event_tag',
    src: __dirname + '/legacy_agenda_event_tag_few.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), options, cb );

}
