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
  add: require('./middleware/add'),
  requireCanEdit: require('./middleware/requireCanEdit'),
  changeState: require('./middleware/changeState'),
  toggleCancelled: require('./middleware/toggleCancelled')
}

module.exports = Object.assign(plugApp, {
  init: (config, services) => AgendaEvents({
    mysql: config.db,
    knex: config.knex,
    redis: config.redis,
    redisClient: config.redisClient,
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
      beforeRemove: beforeRemove.bind(null, { services }),
      getMembers,
      getSourceAgendas: uids => services.agendas
        .list({ uid: uids })
        .then(({ agendas }) => agendas)
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
    members,
    agendas
  } = parentApp.services;

  parentApp.all([
    '/:agendaSlug/events/:eventSlug/state/:state',
    '/:agendaSlug/events/:eventSlug/state',
    '/:agendaSlug/events/:eventSlug/remove',
    '/:agendaSlug/events/:eventSlug/add'
  ], [
    sessions.mw.ifUnlogged((req, res, next) => next({
      code: 403, error: 'requiredLogged', message: 'You need to be logged'
    }))
  ]);

  parentApp.all([
    '/:agendaSlug/events/:eventSlug/state/:state',
    '/:agendaSlug/events/:eventSlug/state',
    '/:agendaSlug/events/:eventSlug/remove',
    '/:agendaSlug/events/:eventSlug/toggle-cancelled'
  ], [
    mw.loadAgenda,
    mw.loadEvent,
    mw.load
  ]);

  parentApp.get('/:agendaSlug/events/:eventSlug/state/:state',
    members.mw.loadAndAuthorize('moderator'),
    mw.changeState
  );

  parentApp.post('/:agendaSlug/events/:eventSlug/state',
    members.mw.loadAndAuthorize('moderator'),
    mw.changeState
  );

  parentApp.get('/:agendaSlug/events/:eventSlug/toggle-cancelled',
    members.mw.load,
    members.mw.authorizeAdminModOrEventOwner,
    mw.toggleCancelled
  );

  parentApp.get('/:agendaSlug/events/:eventSlug/remove',
    members.mw.load,
    mw.remove
  );

  parentApp.get('/:agendaSlug/events/:eventSlug/add/to/:targetAgendaSlug',
    agendas.mw.loadBy({ path: 'params.targetAgendaSlug', field: 'slug', target: 'agenda' }),
    agendas.mw.loadBy({ path: 'params.agendaSlug', field: 'slug', target: 'currentAgenda' }),
    members.mw.loadAndAuthorize('contributor'),
    mw.loadEvent.by({ agenda: 'currentAgenda' }),
    mw.add
  );

  parentApp.post('/:agendaSlug/admin/events/states',
    sessions.mw.loadOrRedirect(),
    mw.loadAgenda,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('moderator'),
    mw.changeState.batched
  );
}
