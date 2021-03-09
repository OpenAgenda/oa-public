"use strict";

const _ = require('lodash');
const { promisify } = require('util');
const w = require('when');

const contributorLabels = require('@openagenda/labels/event/contributors');
const eventReferences = require('@openagenda/agenda-event-references');
const __ = require('@openagenda/labels')(require('@openagenda/labels/event/states'));

const cmn = require('../lib/commons-app');
const legacyEventSvc = require('../services/event');
const legacyAgendaSvc = require('../services/agenda');
const activitiesSvc = require('../services/activities');

const getAgendaTags = promisify(require('@openagenda/agenda-tags').get);
const { getRoleSlug } = require('@openagenda/members').utils;

module.exports = app => {
  const {
    sessions,
    members,
    agendas
  } = app.services;

  app.get(
    '/agendas/:uid/events/:eventUid/custom',
    legacyAgendaSvc.mw.load('uid'),
    sessions.mw.loadOrRedirect(),
    members.mw.load,
    (req, res, next) => {
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
    legacyAgendaSvc.mw.load('uid'),
    sessions.mw.load(),
    members.mw.loadOr((req, res) => {
      res.json({ references: null });
    }),
    legacyEventSvc.mw.load('eventUid', 'uid'),
    legacyEventSvc.mw.components.getReferences,
    (req, res, next) => {
      res.json({
        references: req.referencesRender,
        events: _monolingual(_.get(req, 'references', []), ['title', 'dateRange', 'description'], req.lang)
      });
    }
 );

  app.get(
    '/agendas/:uid/events',
    sessions.mw.loadOrRedirect(),
    legacyAgendaSvc.mw.load('uid'),
    members.mw.load,
    (req, res, next) => {
      req.agendaId = req.agenda.id;
      if (req.member) {
        req.access = members.utils.getRoleSlug(req.member.role);
      }
      next();
    },
    eventReferences.mw.events,
    (req, res) => res.json(_.pick(req, ['events']))
 );

  app.get([
    '/agendas/:uid/events/suggestions',
    '/agendas/:uid/events/:eventUid/suggestions'
 ], sessions.mw.loadOrRedirect(),
    (req, res, next) => {
      req.agenda = { uid: req.params.uid };
      next();
    },
    members.mw.load,
    (req, res, next) => {
      req.sample = Object.keys(req.query.sample).reduce((clean, field) => {
        if (field === 'custom') { // custom key is no longer necessary
          return {
            ...clean,
            ...req.query.sample.custom
          }
        } else {
          return {
            ...clean,
            [field]: req.query.sample[field]
          }
        }
      }, {});
      req.agendaUid = req.params.uid;
      req.exclude = [].concat(req.query.exclude || []).concat(req.params.eventUid || []).map(e => parseInt(e));
      next();
    },
    (req, res, next) => {
      const memberRole = req.app.services.members.utils.getRoleSlug(req.member.role);
      req.app.services.core.agendas(req.params.uid).events.search({
        date: {
          gte: JSON.stringify(new Date()).split('T')[0],
          timezone: 'Europe/Paris'
        },
        mlt: req.sample,
        boost: req.query.boost,
        state: ['administrator', 'moderator'].includes(memberRole) ? null : 2
      }, {}, {
        access: memberRole
      }).then(({ events }) => {
        res.json({
          events: _monolingual(events
            .filter(e => !req.exclude.includes(e.uid))
            .slice(0, parseInt(req.query.limit || 20)),
          ['title', 'dateRange', 'description'],
          req.lang)
        });
      });
    });

  app.get(
    '/agendas/:uid/events/:eventUid/activities',
    legacyAgendaSvc.mw.load('uid'),
    legacyEventSvc.mw.load('eventUid', 'uid'),
    members.mw.loadAndAuthorize('moderator', {
      or: (req, res) => res.json({ count: 0})
    }),
    (req, res, next) => {

      const limit = 20;

      const feed = activitiesSvc.feed({
        entityType: 'agenda',
        entityUid: req.agenda.uid
      });

      feed.get().then(data => {

        if (!data) return res.json({});

        feed.activities.list(
          { object: 'event:' + req.event.uid },
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

}



function _monolingual(events, multilingualFields, preferredLang = 'en') {
  return events.map(ev => _.keys(ev)
    .reduce((e, k) => _.set(e, k, multilingualFields.includes(k) ?
      _.get(ev, [k, preferredLang], ev[k][_.first(_.keys(ev[k]))])
      : ev[k])
    , {}));
}


async function getPrivateEventData(req, res, next) {
  const custom = req.formatted.custom
    .filter(_filterByRole.bind(null, req.member.role))
    .filter(c => c.access !== 'public');

  const labels = req.formatted.customLabels;

  const tagSet = await getAgendaTags(req.agenda.id) || null;
  const tags = tagSet ? await promisify(req.event.getAgendaTags)(req.agenda.id) : null;

  const tagGroups = tagSet ? tagSet.groups.map(g => ({
    name: g.name,
    access: g.access || 'public',
    tags: g.tags.filter(t => tags.map(t => t.id).includes(t.id))
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

function _filterByRole(role, item) {
  if (item.access === 'administrator') {
    return ['administrator', 'moderator'].includes(getRoleSlug(role));
  }

  return true;
}
