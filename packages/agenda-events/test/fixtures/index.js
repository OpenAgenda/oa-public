"use strict";

const fixtures = require( 'fixtures' );

module.exports = function( config, files, cb ) {

  if ( arguments.length === 2 ) {

    cb = files;
    files = [ 'legacy_agenda_event', 'agenda_event' ];

  }

  fixtures.init( { mysql: config.mysql } );

  fixtures( [ {
    table: config.legacy.schemas.agendaEvent,
    src: __dirname + '/legacy_agenda_event.data.sql'
  }, {
    table: config.schemas.agendaEvent,
    src: __dirname + '/agenda_event.data.sql'
  }, {
    table: config.schemas.agendaEvent,
    src: __dirname + '/agenda_event_empty.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), cb );

}