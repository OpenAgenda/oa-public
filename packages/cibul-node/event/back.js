'use strict';

const fs = require('fs');
const _ = require('lodash');

const legacyEventSvc = require('../services/event');
const legacyAgendaSvc = require('../services/agenda');

const renderReferences = _.template(fs.readFileSync(`${__dirname}/references.tpl`));

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
    members.mw.loadAndAuthorize('moderator', {
      or: (req, res) => res.json({ count: 0 })
    }),
    (req, res, next) => {
      const {
        activities: activitiesSvc
      } = req.app.services;

      const limit = 20;

      const feed = activitiesSvc.feed({
        entityType: 'agenda',
        entityUid: req.agenda.uid
      });

      feed.get().then(data => {
        if (!data) return res.json({});

        feed.activities.list(
          { object: `event:${req.event.uid}` },
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
