'use strict';

const _ = require('lodash');
const sessions = require('@openagenda/sessions');
const range = require('@openagenda/date-range');
const agendaSvc = require('@openagenda/agendas');
const activitiesMw = require('@openagenda/activity-apps/dist/middleware');
const membersSvc = require('../services/members');
const cmn = require('../lib/commons-app');

const LIST_LIMIT = 20;

function getBooleanQuery(param) {
  if (param === '0' || param === 'false') return false;
  if (param === '1' || param === 'true') return true;
}

const preMw = [
  cmn.loadLogger('home'),
  sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/'))
];

async function agendasList(req, res, next) {
  const page = req.query.page || 1;
  const offset = (page - 1) * LIST_LIMIT;

  try {
    const members = await membersSvc.list({
      userUid: req.user.uid,
      ...(req.query.role ? { role: req.query.role } : {})
    }, { offset: 0, limit: 1000 });

    const { total, agendas } = await agendaSvc.list({
      uid: members.map(s => s.agendaUid),
      search: req.query.search
    }, offset, LIST_LIMIT, {
      includeImagePath: getBooleanQuery(req.query.includeImagePath) ?? true,
      useDefaultImage: getBooleanQuery(req.query.useDefaultImage) ?? true,
      private: null,
      total: true,
      includeFields: ['settings', 'credentials']
    });

    res.send({
      total,
      isMember: members.length > 0,
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
  const {
    events: eventsSvc
  } = req.app.services;

  const offset = ((req.query.page || 1) - 1) * LIST_LIMIT;

  req.log.debug('fetching events owned by user %s', req.user.uid);

  eventsSvc.list({
    ownerUid: req.user.uid,
    search: req.query.search
  }, {
    offset,
    limit: LIST_LIMIT,
    order: 'updatedAt.desc'
  }, {
    total: true,
    detailed: true,
    useDefaultImage: true,
    draft: null,
    private: null
  }).then(({ total, items }) => {
    req.log.debug('fetched %s of %s events owned by user %s', items.length, total, req.user.uid);

    res.send({
      total,
      events: items.map(event => {
        const timings = (event.timings || []).map(t => ({
          start: new Date(t.begin),
          end: new Date(t.end)
        }));
        return {
          ...event,
          timings,
          timerange: range(timings, req.lang || 'fr', event.timezone || 'Europe/Paris')
        };
      })
    });
  }, next);
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
