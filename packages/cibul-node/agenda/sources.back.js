"use strict";

const React = require('react');
const agendasSvc = require('@openagenda/agendas');
const aggregatorsSvc = require('../services/aggregator').instance;
const activitiesSvc = require('../services/activities');
const cmn = require('../lib/commons-app');
const { parser: agendaAdminParser } = require('../services/lib/layouts/agendaAdmin');

const sessions = require('../services/sessions');
const members = require('../services/members');


const throwUnauthorized = (req, res, next) => {
  const error = new Error('Unauthorized');

  error.statusCode = 401;
  res.statusCode = 401;

  next(error);
};

const checkUser = (req, res, next) => {
  if (!req.user) {
    const error = new Error('Unauthorized');

    error.statusCode = 401;
    res.statusCode = 401;

    return next(error);
  }

  return next();
};

module.exports = app => {
  app.get(
    '/:slug/admin/sources/agenda.json',
    sessions.mw.load,
    checkUser,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator', { or: throwUnauthorized }),
    (req, res) => res.send(agendaAdminParser({
      agenda: req.agenda,
      role: req.member.role,
      lang: req.lang
    }))
  );

  app.get(
    '/:slug/admin/sources/remove',
    sessions.mw.load,
    checkUser,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator', { or: throwUnauthorized }),
    removeSource
  );

  app.get(
    '/:slug/admin/sources/agenda-sources.json',
    sessions.mw.load,
    checkUser,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator', { or: throwUnauthorized }),
    listSources
  );

  // TODO security
  app.get(
    '/agendas/:agendaUid/sources.json',
    cmn.loadAgendaBy({ uid: 'agendaUid' }),
    listSources
  );
};

async function listSources(req, res, next) {
  try {
    const sources = await aggregatorsSvc.sources.list(req.agenda, req.query.search, { detailed: true });

    res.json({ sources });
  } catch (e) {
    next(e);
  }
}

async function removeSource(req, res, next) {
  try {
    const { user, member, agenda, source } = await loadNeeds(req);
    const result = await aggregatorsSvc.sources.remove(agenda, source);

    res.json(result);

    try {
      await addRemoveSourceActivity({ user, member, agenda, source });
    } catch (e) {
      req.log(
        'error',
        'failed adding activity of type agenda.removeSource',
        { member, exception: e }
      );
    }
  } catch (e) {
    next(e);
  }
}

async function loadNeeds(req) {
  const member = await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  });

  if (!member) {
    throw new Error('Cannot found member');
  }

  const source = await agendasSvc.get({ uid: req.query.uid }, { private: null, internal: true });

  if (!source) {
    throw new Error('Cannot found source agenda');
  }

  return {
    user: req.user,
    agenda: req.agenda,
    member,
    source
  };
}

function addRemoveSourceActivity({ user, member, agenda, source }) {
  activitiesSvc.feed({
    entityType: 'agenda',
    entityUid: agenda.uid
  }).activities.add({
    actor: 'user:' + user.uid,
    verb: 'agenda.removeSource',
    object: 'agenda:' + source.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: member.custom.contactName || user.fullName,
        object: source.title,
        target: agenda.title
      }
    }
  });
}
