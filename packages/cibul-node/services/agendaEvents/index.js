'use strict';

const express = require('express');
const AgendaEvents = require('@openagenda/agenda-events');
const eventStates = require('@openagenda/agendas/service/validate/eventStates');
const beforeRemove = require('./beforeRemove');
const onCreate = require('./onCreate');
const onUpdate = require('./onUpdate');
const onRemove = require('./onRemove');

const changeStateMw = require('./middleware/changeState');

const mw = {
  loadAgenda: require('../members/middleware/loadAgenda'),
  loadEvent: require('../members/middleware/loadEvent'),
  load: require('./middleware/load'),
  remove: require('./middleware/remove'),
  requireCanEdit: require('./middleware/requireCanEdit'),
  changeFeatured: require('./middleware/changeFeatured'),
  updateStatus: require('./middleware/updateStatus'),
  batch: require('./middleware/batch'),
  navigate: require('./middleware/navigate')
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
      getMembers: (aes = []) => services.members.list({
        agendaUid: aes?.[0]?.agendaUid,
        userUid: aes.map(ae => ae.userUid).filter(userUid => !!userUid)
      }),
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

  const requireLoggedMw = sessions.mw.ifUnlogged((req, res, next) => next({
    code: 403, error: 'requiredLogged', message: 'You need to be logged'
  }));

  const loadMw = express.Router({ mergeParams: true })
    .use(
      mw.loadAgenda,
      mw.loadEvent,
      mw.load
    );

  parentApp.get('/:agendaSlug/events/:eventSlug/state/:state', [
    requireLoggedMw,
    loadMw,
    members.mw.loadAndAuthorize('moderator'),
    changeStateMw
  ]);

  parentApp.post('/:agendaSlug/events/:eventSlug/state', [
    requireLoggedMw,
    loadMw,
    members.mw.loadAndAuthorize('moderator'),
    changeStateMw
  ]);

  parentApp.get('/:agendaSlug/events/:eventSlug/status',
    requireLoggedMw,
    loadMw,
    members.mw.load,
    members.mw.authorizeAdminModOrEventOwner,
    mw.updateStatus
  );

  parentApp.delete('/:agendaSlug/events/:eventSlug',
    requireLoggedMw,
    loadMw,
    members.mw.load,
    mw.remove
  );

  parentApp.get('/:agendaSlug/events/:eventSlug/remove',
    requireLoggedMw,
    loadMw,
    members.mw.load,
    mw.remove
  );

  parentApp.get('/:agendaSlug/events/:eventSlug/featured/:type',
    requireLoggedMw,
    loadMw,
    members.mw.loadAndAuthorize('moderator'),
    mw.changeFeatured
  );

  parentApp.post('/:agendaSlug/admin/events/states', [
    sessions.mw.loadOrRedirect(),
    mw.loadAgenda,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('moderator'),
    changeStateMw.batched
  ]);

  parentApp.all('/:agendaSlug/admin/events/batch',
    sessions.mw.loadOrRedirect(),
    mw.loadAgenda,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('moderator'),
    mw.batch
  );

  parentApp.get('/:agendaSlug/admin/events/navigate',
    sessions.mw.loadOrRedirect(),
    mw.loadAgenda,
    agendas.mw.authorizeByIPAddress(),
    mw.navigate
  );
}
