'use strict';

const { promisify } = require('util');
const fs = require('fs');
const _ = require('lodash');

const contributorLabels = require('@openagenda/labels/event/contributors');

const { getRoleSlug } = require('@openagenda/members').utils;

const cmn = require('../lib/commons-app');
const legacyEventSvc = require('../services/event');
const legacyAgendaSvc = require('../services/agenda');

const renderReferences = _.template(fs.readFileSync(`${__dirname}/references.tpl`));

function _filterByRole(role, item) {
  if (item.access === 'administrator') {
    return ['administrator', 'moderator'].includes(getRoleSlug(role));
  }

  return true;
}

async function getPrivateEventData(req, res) {
  const {
    legacy: {
      getTagSet
    }
  } = req.app.services;
  const custom = req.formatted.custom
    .filter(_filterByRole.bind(null, req.member.role))
    .filter(c => c.access !== 'public');

  const labels = req.formatted.customLabels;

  const tagSet = await getTagSet(req.agenda.id) || null;
  const tags = tagSet ? await promisify(req.event.getAgendaTags)(req.agenda.id) : null;

  const tagGroups = tagSet ? tagSet.groups.map(g => ({
    name: g.name,
    access: g.access || 'public',
    tags: g.tags.filter(t => tags.map(tg => tg.id).includes(t.id))
  })).filter(_filterByRole.bind(null, req.member.role)) : [];

  const contributor = _.omit(await promisify(req.event.getContributorInfo)(), ['organizationSlug']);

  cmn.renderJson(req, res, {
    custom: {
      custom,
      labels
    },
    authorizations: await req.app.services.core.users(req.user.uid).agendas(req.agenda.uid).getAuthorizations(req.event),
    contributor: {
      data: contributor,
      labels: {
        organization: contributorLabels.organization[req.lang],
        contactNumber: contributorLabels.contactNumber[req.lang],
        contactName: contributorLabels.contactName[req.lang],
        contactPosition: contributorLabels.contactPosition[req.lang]
      }
    },
    tagGroups
  });
}

module.exports = app => {
  const {
    sessions,
    members,
    core
  } = app.services;

  app.get(
    '/agendas/:uid/events/:eventUid/custom',
    legacyAgendaSvc.mw.load('uid'),
    sessions.mw.loadOrRedirect(),
    members.mw.load,
    (req, res) => {
      req.app.services.core.agendas(req.agenda.uid).events.get(req.params.eventUid, {
        load: {
          custom: true
        },
        returnPayload: true,
        access: req.member ? members.utils.getRoleSlug(req.member.role) : 'nobody',
      }).then(result => res.json({
        event: result.event,
        schema: result.formSchema
      }));
    }
  );

  app.get(
    '/agendas/:uid/events/:eventUid/private',
    legacyAgendaSvc.mw.load('uid'),
    legacyEventSvc.mw.load('eventUid', 'uid'),
    sessions.mw.loadOrRedirect(),
    members.mw.load,
    (req, res, next) => {
      if (!req.member || !members.utils.compareRoles.isSuperiorToOrEqual('contributor')) {
        return res.sendStatus(403);
      }
      next();
    },
    legacyEventSvc.mw.format,
    legacyAgendaSvc.mw.decorateEvent(true),
    getPrivateEventData
  );

  app.get(
    '/agendas/:uid/events/:eventUid/references',
    sessions.mw.load(),
    (req, res, next) => core
      .agendas(req.params.uid)
      .events
      .get(req.params.eventUid)
      .then(event => {
        if (!event?.references?.length) {
          return res.json({
            references: null,
            events: []
          });
        }
        req.originAgendaUid = event.agendaUid;
        req.references = event.references;
        next();
      }, next),
    (req, res, next) => core
      .agendas(req.originAgendaUid)
      .events
      .search({ uid: req.references }, {}, { monolingual: req.lang })
      .then(({ events }) => {
        res.json({
          references: renderReferences({ events }),
          events
        });
      }, next)
  );

  app.get([
    '/agendas/:uid/events/suggestions',
    '/agendas/:uid/events/:eventUid/suggestions'
  ],
  sessions.mw.loadOrRedirect(),
  (req, res, next) => {
    req.agenda = { uid: req.params.uid };
    next();
  },
  (req, res, next) => {
    req.sample = req.query.sample;
    req.agendaUid = req.params.uid;
    req.exclude = [].concat(req.query.exclude || []).concat(req.params.eventUid || []).map(e => parseInt(e, 10));
    next();
  },
  (req, res) => {
    req.app.services.core.agendas(req.params.uid).events.search({
      date: {
        gte: JSON.stringify(new Date()).split('T')[0],
        timezone: 'Europe/Paris'
      },
      mlt: req.sample,
      boost: req.query.boost
    }, {}, {
      userUid: req?.user.uid,
      monolingual: req.lang
    }).then(result => {
      res.json(result);
    });
  });

  app.get(
    '/agendas/:uid/events/:eventUid/activities',
    legacyAgendaSvc.mw.load('uid'),
    legacyEventSvc.mw.load('eventUid', 'uid'),
    sessions.mw.load(),
    // members.mw.loadAndAuthorize('moderator', {
    //   or: (req, res) => res.json({ count: 0 })
    // }),
    (req, res, next) => {
      if (!req.user) {
        return res.json({ count: 0 });
      }

      const {
        activities: activitiesSvc
      } = req.app.services;

      const limit = 20;

      const feed = activitiesSvc.feed({
        entityType: 'user',
        entityUid: req.user.uid
      });

      feed.get().then(data => {
        if (!data) return res.json({});

        feed.activities.list(
          { object: `event:${req.event.uid}`/* , target: `agenda:${req.agenda.uid}` */ },
          req.query.fromId || 0,
          limit
        )

          .then(activities => {
            const lastPage = activities.length < limit;

            res.json({
              activities,
              count: activities.length,
              nextUrl: lastPage
                ? null
                : `/agendas/${req.agenda.uid}/events/${req.event.uid}/activities?fromId=${activities[activities.length - 1].id}`
            });
          })
          .catch(next);
      });
    }
  );
};
