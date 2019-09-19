"use strict";

const _ = require('lodash');
const React = require('react');
const sessions = require('@openagenda/sessions');
const range = require( '@openagenda/date-range' );
const agendaSvc = require('@openagenda/agendas');
const eventsSvc = require('@openagenda/events');
const membersSvc = require('../services/members');
const activitiesMw = require('@openagenda/activity-apps/dist/middleware');
const cmn = require('../lib/commons-app');

const LIST_LIMIT = 20;

const preMw = [
  cmn.loadLogger('home'),
  sessions.middleware.ifUnlogged((req, res) => res.redirect(302, '/'))
];

async function agendasList(req, res, next) {
  const page = req.query.page || 1;
  const offset = (page - 1) * LIST_LIMIT;

  try {
    const members = await membersSvc.list({ userUid: req.user.uid }, { offset: 0, limit: 500 });

    const { total, agendas } = await agendaSvc.list({
      uid: members.map(s => s.agendaUid),
      search: req.query.search
    }, offset, LIST_LIMIT, {
      includeImagePath: true,
      private: null,
      total: true,
      useDefaultImage: true,
      includeFields: ['settings', 'credentials']
    });

    res.send({
      total,
      agendas: agendas.map(agenda => _.assign(_.omit(agenda, ['credentials']), {
        member: members.find(s => s.agendaUid === agenda.uid),
        useContributeApp: _.get(agenda, 'credentials.useContributeApp', false),
        mailto: cmn.agendaMailTo(agenda)
      }))
    });
  } catch (e) {
    next(e);
  }
}

function eventsList(req, res, next) {
  const offset = ((req.query.page || 1) - 1) * LIST_LIMIT;

  req.log('fetching events owned by user %s', req.user.uid);

  eventsSvc.list(
    { draft: null, ownerUid: req.user.uid, order: 'updatedAt.desc', search: req.query.search },
    offset,
    LIST_LIMIT,
    { private: null, total: true, detailed: true, useDefaultImage: true },
    (err, events, total) => {
      if (err) {
        return next(err);
      }

      req.log('fetched %s of %s events owned by user %s', events.length, total, req.user.uid);

      res.send({
        total,
        events: events.map(event => {
          const timings = (event.timings || []).map(t => ({ start: new Date(t.begin), end: new Date(t.end) }));
          const timerange = range(timings, req.lang || 'fr', event.timezone || 'Europe/Paris');

          return Object.assign({}, event, { timerange });
        })
      });
    }
  );
}

module.exports = app => {
  app.get(
    '/home/agendas',
    preMw,
    agendasList
  );

  app.get(
    '/home/events.json',
    preMw,
    eventsList
  );

  app.get(
    '/home/activities/list',
    preMw,
    (req, res) => activitiesMw.list({ entityType: 'user', entityUid: req.user.uid })(req, res)
  );
};
