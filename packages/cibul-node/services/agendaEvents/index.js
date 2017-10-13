"use strict";

const logger = require( 'logger' );
const legacy = require( './legacy' );
const agendaEvents = require( 'agenda-events' );
const eventStates = require( 'agendas/service/validate/eventStates' );

const interfaces = {
  onCreate: require( './onCreate' ),
  onUpdate: require( './onUpdate' ),
  onRemove: require( './onRemove' ),
  beforeRemove: require( './beforeRemove' )
};

module.exports = {
  init,
  legacy
}

function init( config ) {

  agendaEvents.init( {
    mysql: config.db,
    redis: config.redis,
    logger,
    schemas: {
      agendaEvent: config.schemas.agendaEventService
    },
    legacy: {
      mysql: config.db,
      schemas: {
        agendaEvent: config.schemas.agendaEvent,
        event: config.schemas.event,
        agenda: config.schemas.agenda,
        user: config.schemas.user
      },
      interval: 1000
    },
    eventStates,
    interfaces
  } );

}