"use strict";

const fixtures = require( 'fixtures' );

module.exports = function( config, tables, cb ) {

  fixtures.init( { mysql: config.mysql } );

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
    table: 'legacy_location',
    src: __dirname + '/legacy_location.data.sql'
  }, {
    table: 'legacy_agenda',
    src: __dirname + '/legacy_agenda.data.sql'
  }, {
    table: 'legacy_deleted',
    src: __dirname + '/legacy_deleted.data.sql'
  } ].filter( c => tables.indexOf( c.key || c.table ) !== -1 ), cb );

}