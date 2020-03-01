'use strict';

const AgendaEvents = require('@openagenda/agenda-events');
const eventStates = require('@openagenda/agendas/service/validate/eventStates');

const beforeRemove = require('./beforeRemove');
const getMembers = require('./getMembers');
const onCreate = require('./onCreate');
const onUpdate = require('./onUpdate');
const onRemove = require('./onRemove');

const mw = {
  loadAgenda: require('../members/middleware/loadAgenda'),
  loadEvent: require('../members/middleware/loadEvent'),
  load: require('./middleware/load'),
  remove: require('./middleware/remove'),
  requireCanEdit: require('./middleware/requireCanEdit'),
  changeState: require('./middleware/changeState')
}

module.exports = Object.assign(plugApp, {
  init: (config, services) => AgendaEvents({
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
      onCreate: onCreate.bind(null, { config, services }),
      onUpdate: onUpdate.bind(null, { config, services }),
      onRemove: onRemove.bind(null, { services }),
      beforeRemove,
      getMembers
    }
  }),
  mw: {
    // make the variants load and loadOrFail
    loadOrFail: mw.load
  }
});



function plugApp(parentApp) {
  const {
    sessions,
    members
  } = parentApp.services;

  parentApp.all([
    '/:agendaSlug/events/:eventSlug/state/:state',
    '/:agendaSlug/events/:eventSlug/remove'
  ], [
    sessions.middleware.ifUnlogged((req, res, next) => next({
      code: 403, error: 'requiredLogged', message: 'You need to be logged'
    })),
    mw.loadAgenda,
    mw.loadEvent,
    mw.load
  ]);

  parentApp.get('/:agendaSlug/events/:eventSlug/state/:state',
    members.mw.loadAndAuthorize('moderator'),
    mw.changeState
  );

  parentApp.get('/:agendaSlug/events/:eventSlug/remove',
    members.mw.load,
    mw.remove
  );

  parentApp.post('/:agendaSlug/admin/events/states',
    sessions.mw.loadOrRedirect,
    mw.loadAgenda,
    members.mw.loadAndAuthorize('moderator'),
    mw.changeState.batched
  );
}
