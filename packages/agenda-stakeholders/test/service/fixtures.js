"use strict";

const fixtures = require( '@openagenda/fixtures' );

module.exports = function( config, files, options, cb ) {

  fixtures.init( { mysql: config.mysql } );

  fixtures( [ {
    table: config.schemas.agenda,
    src: __dirname + '/agenda.data.sql'
  }, {
    table: config.schemas.event,
    src: __dirname + '/event.data.sql'
  }, {
    table: config.schemas.stakeholder,
    src: __dirname + '/stakeholder.data.sql'
  }, {
    table: config.schemas.stakeholder,
    src: __dirname + '/stakeholder_empty.data.sql'
  }, {
    table: config.schemas.agendaEvent,
    src: __dirname + '/agenda_event.data.sql'
  }, {
    table: config.schemas.stakeholderSettings,
    src: __dirname + '/stakeholder_settings.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), options, cb );

}