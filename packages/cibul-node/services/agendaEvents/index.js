"use strict";

const agendaEvents = require( 'agenda-events' ),

  logger = require( 'logger' ),

  eventStates = require( 'agendas/service/validate/eventStates' ),

  interfaces = {
    onCreate: require( './onCreate' ),
    onUpdate: require( './onUpdate' ),
    onRemove: require( './onRemove' ),
    beforeRemove: require( './beforeRemove' )
  },

  legacy = require( './legacy' );

let log = console.log;

module.exports = {
  init,
  legacy
}

function init( config ) {

  log = logger( 'agendaEvents/interfaces' );

  Object.keys( interfaces ).forEach( k => interfaces[ k ].setLog( logger( 'agendaEvents/interfaces/' + k ) ) );

  legacy.setLog( logger( 'agendaEvents/interfaces/legacy' ) );

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