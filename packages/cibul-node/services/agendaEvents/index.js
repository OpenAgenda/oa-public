"use strict";

const legacy = require( './legacy' );
const agendaEvents = require( '@openagenda/agenda-events' );
const eventStates = require( '@openagenda/agendas/service/validate/eventStates' );
const sessions = require( '@openagenda/sessions' );

const members = require( '../members' );

const onCreate = require( './onCreate' );
const onUpdate = require( './onUpdate' );
const onRemove = require( './onRemove' );
const beforeRemove = require( './beforeRemove' );

const mw = {
  loadAgenda: require( '../members/middleware/loadAgenda' ),
  loadEvent: require( '../members/middleware/loadEvent' ),
  load: require( './middleware/load' ),
  requireCanEdit: require( './middleware/requireCanEdit' ),
  changeState: require( './middleware/changeState' )
}

module.exports = Object.assign( plugApp, {
  init,
  legacy,
  mw: {
    // make the variants load and loadOrFail
    loadOrFail: mw.load
  }
} );

function init(config) {

  agendaEvents.init( {
    mysql: config.db,
    knex: config.knex,
    redis: config.redis,
    logger: config.getLogConfig( 'svc', 'agendaEvents' ),
    schemas: {
      agendaEvent: config.schemas.agendaEventService
    },
    legacy: {
      schemas: {
        agendaEvent: config.schemas.agendaEvent,
        eventEditor: config.schemas.eventEditor,
        event: config.schemas.event,
        agenda: config.schemas.agenda,
        user: config.schemas.user
      },
      interval: 1000
    },
    eventStates,
    interfaces: {
      onCreate: onCreate.bind(null, config),
      onUpdate: onUpdate.bind(null, config),
      onRemove,
      beforeRemove,
    }
  } );

}

function plugApp( parentApp ) {

  parentApp.all( [
    '/:agendaSlug/events/:eventSlug/state/:state'
  ], [
    sessions.middleware.ifUnlogged( ( req, res, next ) => next( {
      code: 403, error: 'requiredLogged', message: 'You need to be logged'
    } ) ),
    mw.loadAgenda,
    mw.loadEvent,
    mw.load
  ] );

  parentApp.get( '/:agendaSlug/events/:eventSlug/state/:state',
    members.mw.loadAndAuthorize('moderator'),
    mw.changeState
  );

}
