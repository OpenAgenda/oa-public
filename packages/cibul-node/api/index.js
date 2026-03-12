import _ from 'lodash';
import express from 'express';
import logs from '@openagenda/logs';
import { NotAuthenticated } from '@openagenda/verror';
import sentryErrorHandler from '../lib/sentryErrorHandler.js';
import * as track from '../lib/track.js';
import * as otelMw from '../lib/otelMw.js';
import boolQuery from '../lib/boolQuery.js';
import * as mw from './middleware/index.js';
import getSettingsEndpoint from './endpoints/settingsGet.js';
import getSettingsResyncEndpoint from './endpoints/settingsResync.js';
import apiErrorHandler from './errorHandler.js';

const log = logs('api');

const settings = {
  get: getSettingsEndpoint,
  resync: getSettingsResyncEndpoint,
};

export default (core, { useRouter = true } = {}) => {
  log('init');

  const app = useRouter ? express.Router() : express();

  app.core = core;
  app.services = core.services;

  const { allowSuperAdmin, verifyTransverseApiAccess } = app.services.users.mw;

  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  const imageMw = app.services.events.middleware.imageTransformAndUpload([
    {
      name: 'image',
      unique: true,
    },
  ]);

  app.post('/agendas/:agendaUid/events(/*)?', imageMw);
  app.put('/agendas/:agendaUid/events(/*)?', imageMw);
  app.patch('/agendas/:agendaUid/events(/*)?', imageMw);
  app.post('/agendas/:agendaUid/locations(/*)?', imageMw);
  app.put('/agendas/:agendaUid/locations(/*)?', imageMw);
  app.patch('/agendas/:agendaUid/locations(/*)?', imageMw);

  app.post('*', mw.parseBodyData);
  app.put('*', mw.parseBodyData);
  app.patch('*', mw.parseBodyData);

  app.post('/requestAccessToken', mw.requestAccessToken);

  app.post('/password/evaluate', (req, res) => {
    res.json(
      req.app.services.security.passwords.evaluate(req.body.password, {
        identifiers: req.body.identifiers,
      }),
    );
  });

  // access token control and user load
  app.post('*', mw.verifyAndLoadAccessTokenUser);
  app.patch('*', mw.verifyAndLoadAccessTokenUser);
  app.put('*', mw.verifyAndLoadAccessTokenUser);
  app.delete('*', mw.verifyAndLoadAccessTokenUser);

  app.get('*', mw.verifyAndLoadAgendaOrUserFromKey);

  app.use(otelMw.addUserContext);

  // load all the things
  app.param('agendaUid', mw.loadAgenda);
  app.param('agendaSlug', mw.loadAgenda);
  app.param('eventUid', mw.loadEvent);
  app.param('eventSlug', mw.loadEvent);

  app.use(
    [
      '/agendas/:agendaUid/events/:eventUid/activities',
      '/agendas/:agendaUid/events/:eventUid.pdf',
      '/agendas/:agendaUid/events/slug/:eventSlug.pdf',
      '/agendas/slug/:agendaSlug/events/slug/:eventSlug.pdf',
    ],
    mw.loadEvent.full,
  );

  // control all the things
  app.post('/agendas/:agendaUid/events(/*?)?', mw.member.allow());
  app.patch('/agendas/:agendaUid/events(/*?)?', mw.member.allow());
  app.put('/agendas/:agendaUid/events(/*?)?', mw.member.allow());
  app.get('/agendas/:agendaUid.prv', mw.member.allow());
  app.get(
    [
      '/agendas/slug/:agendaSlug',
      '/agendas/:agendaUid',
      '/agendas/:agendaUid/events/:eventUid',
      // '/agendas/:agendaUid/settings(/*?)?',
    ],
    mw.member.load,
  );

  app.get(
    ['/agendas/slug/:agendaSlug', '/agendas/:agendaUid'],
    mw.redirectIfPrivate,
  );

  app.post('/agendas', (req, res, next) =>
    core.agendas
      .create(req.parsedData, { userUid: req.user.uid })
      .then((agenda) => res.json(agenda), next));

  app.patch(
    '/agendas/:agendaUid',
    mw.member.load,
    mw.member.allow(['administrator']),
    (req, res, next) => {
      const config = core.getConfig();
      const isSuperAdmin = req.user.isSuperAdmin || config.superAdminUids.includes(req.user.uid);

      core
        .agendas(req.agenda.uid)
        .update(req.parsedData, {
          protected: !isSuperAdmin, // false for superadmins, true for others
        })
        .then((agenda) => res.json(agenda), next);
    },
  );

  app.get(
    [
      '/agendas/slug/:agendaSlug',
      '/agendas/:agendaUid',
      '/agendas/:agendaUid.prv',
    ],
    async (req, res, next) =>
      res.json(
        await core
          .agendas(req.agenda.uid)
          .get({
            access: req.access,
            useCache: true,
            includeEvent: true,
            detailed: (req.query.detailed ?? '1') === '1',
            private: req.member ? null : false,
            includeNonDataFields: req.query.includeNonDataFields === '1',
            includeMemberSchema: req.query.includeMemberSchema,
          })
          .catch(next),
      ),
  );

  app.delete(
    '/agendas/:agendaUid',
    core.services.users.mw.verifyHeadersPassword,
    mw.member.load,
    mw.member.allow(['administrator'], {
      or: allowSuperAdmin({ redirect: false }),
    }),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .remove()
        .then((result) => res.json(result), next),
  );

  app.get(
    ['/agendas/:agendaUid/sources', '/agendas/slug/:agendaSlug/sources'],
    mw.member.load,
    mw.member.allow(['administrator'], {
      or: allowSuperAdmin({ redirect: false }),
    }),
    (req, res, next) =>
      core
        .agendas(req.agenda)
        .sources.list(req.query, req.query, req.query)
        .then((r) => {
          res.json(r);
        }, next),
  );

  app.post(
    [
      '/agendas/:agendaUid/sources/:sourceAgendaUid',
      '/agendas/slug/:agendaSlug/sources/:sourceAgendaUid',
    ],
    mw.member.load,
    mw.member.allow(['administrator']),
    (req, res, next) =>
      core
        .agendas(req.agenda)
        .sources.create(req.params.sourceAgendaUid, req.body.rules, {
          query: req.body.query,
        })
        .then((r) => {
          res.json(r);
        }, next),
  );

  app.patch(
    [
      '/agendas/:agendaUid/sources/:sourceAgendaUid',
      '/agendas/slug/:agendaSlug/sources/:sourceAgendaUid',
    ],
    mw.member.load,
    mw.member.allow(['administrator']),
    (req, res, next) =>
      core
        .agendas(req.agenda)
        .sources.patch(req.params.sourceAgendaUid, req.body.rules, {
          query: req.body.query,
        })
        .then((r) => {
          res.json(r);
        }, next),
  );

  app.post('/agendas/:agendaUid/events', (req, res, next) =>
    core
      .agendas(req.agenda.uid)
      .events.create(req.parsedData, {
        context: {
          userUid: req.member.userUid,
        },
        access: req.access,
        defaultLang: req.headers.lang,
        callOrigin: 'api',
        returnPayload: true,
      })
      .then(({ event, times }) => {
        req.times = times;
        res.json({
          success: true,
          event,
        });
      }, next));

  app.post('/agendas/:agendaUid/events/search', [
    track.mw('api', 'list', 'events'),
    mw.validateNavSize,
    mw.searchAgendaEvents(core, { queryNamespace: 'parsedData' }),
    ...app.services.usageCounters
      ? [app.services.usageCounters.mw.increment('agendaEvents')]
      : [],
    (_req, res, next) => {
      if (!res.headersSent) next();
    },
  ]);

  app.post('/agendas/:agendaUid/events/:eventUid', mw.eventUpdate);

  app.patch('/agendas/:agendaUid/events/:eventUid', mw.eventUpdate);

  app.delete('/agendas/:agendaUid/events/:eventUid', (req, res, next) =>
    core
      .agendas(req.agenda.uid)
      .events.remove(req.event.uid, {
        context: {
          agendaUid: req.agenda.uid,
          userUid: req.user.uid,
          user: req.user,
          member: req.member,
        },
        private: null,
        returnPayload: true,
      })
      .then(({ removed, times }) => {
        req.times = times;
        res.json({ success: true, event: removed });
      }, next));

  app.get('/agendas/:agendaUid/events/:eventUid/references', (req, res, next) =>
    core
      .agendas(req.agenda.uid)
      .events.references(
        req.event.uid,
        {},
        {
          userUid: req.user?.uid,
        },
      )
      .then((references) => res.json({ success: true, references }), next));

  app.post('/agendas/:agendaUid/events/:eventUid/conversations', [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .events(req.event.uid)
        .conversations.create(req.parsedData, {
          userUid: req.user.uid,
        })
        .then(() => res.json({ success: true }), next),
  ]);

  if (app.services.activities) {
    app.get(
      '/agendas/:agendaUid/events/:eventUid/activities',
      mw.member.allow(['contributor', 'moderator', 'administrator']),
      app.services.activities.mw.listUserEventActivities,
    );
  }

  app.get(
    ['/agendas/:agendaUid/events', '/agendas/slug/:agendaSlug/events'],
    [
      mw.convertLegacyFilter,
      track.mw('api', 'list', 'events'),
      mw.validateNavSize,
      mw.searchAgendaEvents(core),
      ...app.services.usageCounters
        ? [app.services.usageCounters.mw.increment('agendaEvents')]
        : [],
      (_req, res, next) => {
        if (!res.headersSent) next();
      },
    ],
  );

  app.get('/agendas/:agendaUid/events.json-ld', [
    track.mw('api', 'list', 'events'),
    mw.validateNavSize,
    mw.searchAgendaEvents(core, {
      sendResponse: false,
      queryNamespace: 'query',
      stream: true,
      forceIncludeFields: [
        'uid',
        'slug',
        'title',
        'description',
        'timings',
        'status',
        'attendanceMode',
        'originAgenda',
        'registration',
        'image',
        'location.name',
        'location.address',
        'location.city',
        'location.region',
        'location.postalCode',
        'location.countryCode',
        'location.latitude',
        'location.longitude',
        'age',
      ],
    }),
    mw.sendJSONLD,
  ]);

  app.get(
    [
      '/agendas/:agendaUid/events/:eventUid.pdf',
      '/agendas/:agendaUid/events/slug/:eventSlug.pdf',
      '/agendas/slug/:agendaSlug/events/slug/:eventSlug.pdf',
    ],
    [
      (req, _res, next) =>
        core
          .agendas(req.agenda.uid)
          .get({
            detailed: true,
            access: 'internal',
            includeNonDataFields: true,
            includeEvent: true,
          })
          .then((agenda) => {
            req.agenda = agenda;
            next();
          }),
      mw.evaluateAnonymousAccess,
      mw.loadEventPDF,
    ],
  );

  app.get(
    [
      '/agendas/:agendaUid/events/:eventUid',
      '/agendas/:agendaUid/events/slug/:eventSlug',
      '/agendas/slug/:agendaSlug/events/slug/:eventSlug',
    ],
    [
      mw.evaluateAnonymousAccess,
      mw.getEventFromSearchOrAsDraft,
      track.mw('api', 'get', 'events'),
      (req, res) =>
        res.json({
          success: true,
          event: req.event,
        }),
    ],
  );

  app.get('/agendas/:agendaUid/events/ext/:extKey/:extId', [
    mw.evaluateAnonymousAccess,
    mw.getEventFromSearchOrAsDraft,
    track.mw('api', 'get', 'events'),
    (req, res) =>
      res.json({
        success: true,
        event: req.event,
      }),
  ]);

  app.put('/agendas/:agendaUid/events/ext/:extKey/:extId', [
    mw.evaluateAnonymousAccess,
    mw.eventUpdate.byExtId,
  ]);

  app.patch('/agendas/:agendaUid/events/ext/:extKey/:extId', [
    mw.evaluateAnonymousAccess,
    mw.eventUpdate.byExtId,
  ]);

  app.delete('/agendas/:agendaUid/events/ext/:extKey/:extId', [
    mw.evaluateAnonymousAccess,
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .events.removeByExtId(req.params.extKey, req.params.extId, {
          context: {
            userUid: req.user.uid,
          },
        })
        .then((event) => res.json({ success: true, event }), next),
  ]);

  app.get('/agendas/:agendaUid/settings', [
    mw.member.allow(['administrator']),
    track.mw('api', 'get', 'settings'),
    settings.get,
  ]);

  app.get('/agendas/:agendaUid/settings/eventSchema', [
    mw.member.allow(['administrator', 'moderator']),
    track.mw('api', 'get', 'eventSchema'),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .settings.schema.getMerged({ lang: req.lang || req.query.lang || 'fr' })
        .then((data) => res.json({ ...data }), next),
  ]);

  app.get('/agendas/:agendaUid/settings/eventSchema/configure', [
    mw.member.allow(['administrator']),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .settings.schema.getAndParents({
          lang: req.lang || req.query.lang || 'fr',
        })
        .then((data) => res.json({ ...data }), next),
  ]);

  app.post('/agendas/:agendaUid/settings/eventSchema/configure', [
    mw.member.allow(['administrator']),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .settings.schema.updateFields(req.parsedData.fields)
        .then((updatedSchema) => res.json(updatedSchema), next),
  ]);

  app.get('/agendas/:agendaUid/settings/memberSchema', [
    mw.member.load,
    track.mw('api', 'get', 'memberSchema'),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .settings.schema.getMember({
          userUid: req.user.uid,
          lang: req.lang || req.query.lang || 'fr',
          member: req.member,
        })
        .then((data) => res.json({ ...data }), next),
  ]);

  app.get('/agendas/:agendaUid/settings/passCulture', [
    mw.member.allow(['administrator', 'contributor', 'moderator']),
    (req, res, next) => {
      if (!req.agenda.settings.registration.passCulture.siren) {
        return res.json(null);
      }
      core.services
        .registrations(req.agenda.settings.registration)
        .passCulture.getParameters()
        .then((data) => res.json(data), next);
    },
  ]);

  app.get('/agendas/:agendaUid/events/:eventUid/passCulture/bookings', [
    mw.member.allow(['administrator', 'contributor', 'moderator']),
    (req, res, next) => {
      core.services.registrations.utils.passCulture
        .bookings(req.agenda, req.event, req.user.uid)
        .then((data) => res.json(data), next);
    },
  ]);

  app.get('/agendas/:agendaUid/settings/memberSchema/configure', [
    mw.member.load,
    mw.member.allow(['administrator']),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .settings.schema.getMemberAndParents({
          userUid: req.user.uid,
          lang: req.lang || req.query.lang || 'fr',
        })
        .then((data) => res.json({ ...data }), next),
  ]);

  app.post('/agendas/:agendaUid/settings/memberSchema/configure', [
    mw.member.load,
    mw.member.allow(['administrator']),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .settings.schema.updateMemberFields(req.parsedData.fields, {
          actingMember: req.member,
        })
        .then(
          (updatedSchema) => res.json(updatedSchema),
          (err) => next(err),
        ),
  ]);

  app.get('/agendas/:agendaUid/members', [
    mw.member.allow(['administrator', 'moderator'], {
      or: allowSuperAdmin({ redirect: false }),
    }),
    track.mw('api', 'list', 'members'),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .members.list(req.query, req.query, {
          userUid: req.user.uid,
          detailed: req.query.detailed,
          access: req.access,
        })
        .then(
          (data) =>
            res.json({
              ...data,
              success: true,
            }),
          next,
        ),
  ]);

  app.post(
    '/agendas/:agendaUid/members/invite',
    mw.member.load,
    mw.member.loadContext,
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .members.invite(
          {
            role: req.body.role,
            emails: req.body.emails,
            message: req.body.message,
          },
          {
            context: req.context,
            userUid: req.user.uid,
          },
        )
        .then((data) => res.json(data), next),
  );

  app.post('/agendas/:agendaUid/members', (req, res, next) =>
    core
      .agendas(req.agenda.uid)
      .members.create(
        req.body.userUid ?? req.user.uid,
        req.body.role,
        req.parsedData,
        {
          userUid: req.user.uid,
          context: {
            silent: boolQuery(req.query.silent),
          },
        },
      )
      .then((member) => res.json(member), next));

  app.get('/agendas/:agendaUid/members/email/:email', [
    mw.member.load,
    track.mw('api', 'get', 'memberEmail'),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .members.get(
          {
            email: req.params.email,
          },
          {
            userUid: req.user.uid,
            detailed: req.query.detailed,
          },
        )
        .then((data) => res.json(data), next),
  ]);

  app.get('/agendas/:agendaUid/members/:userUid', [
    mw.member.load,
    track.mw('api', 'get', 'member'),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .members.get(req.params.userUid, {
          userUid: req.user.uid,
          access: req.access,
        })
        .then((member) => res.json(member), next),
  ]);

  app.patch(
    [
      '/agendas/:agendaUid/members/:userUid',
      '/agendas/:agendaUid/members/member/:memberId',
    ],
    [
      mw.member.load,
      (req, res, next) =>
        core
          .agendas(req.agenda.uid)
          .members.patch(
            req.params.memberId
              ? { id: req.params.memberId }
              : { userUid: req.params.userUid },
            req.parsedData,
            { userUid: req.user.uid },
          )
          .then((member) => res.json(member), next),
    ],
  );

  app.delete(
    [
      '/agendas/:agendaUid/members/:userUid',
      '/agendas/:agendaUid/members/member/:memberId',
    ],
    [
      mw.member.load,
      (req, res, next) =>
        core
          .agendas(req.agenda.uid)
          .members.remove(
            req.params.memberId
              ? { id: req.params.memberId }
              : { userUid: req.params.userUid },
            {
              userUid: req.user.uid,
            },
          )
          .then(
            () =>
              res.json({
                success: true,
              }),
            next,
          ),
    ],
  );

  app.post('/agendas/:agendaUid/members/sendGroupMail', [
    mw.member.load,
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) =>
      core
        .agendas(req.agenda)
        .members(req.member)
        .sendGroupMail(req.query, req.parsedData, {
          lang: req.lang,
          user: req.user,
        })
        .then(() => res.json({ dontKnowWhat: true }), next),
  ]);

  app.post('/agendas/:agendaUid/locations', [
    mw.member.allow(['administrator', 'moderator', 'contributor']),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .locations.create(req.parsedData, {
          context: {
            userUid: req.user.uid,
          },
          autocomplete: (req.query.autocomplete ?? '1') === '1',
        })
        .then(
          (location) =>
            res.json({
              success: true,
              location,
            }),
          next,
        ),
  ]);

  app.param('locationExtValue', (req, res, next) => {
    req.locationIdentifier = {
      extId: {
        key: req.params.locationExtKey ?? 'default',
        value: req.params.locationExtValue,
      },
    };
    next();
  });

  app.param('locationUid', (req, res, next) => {
    req.locationIdentifier = {
      uid: req.params.locationUid,
    };
    next();
  });

  app.param('targetAgendaUid', (req, res, next) => {
    req.targetAgendaUid = {
      uid: req.params.targetAgendaUid,
    };
    next();
  });

  app.param('locationSlug', (req, res, next) => {
    req.locationIdentifier = {
      slug: req.params.locationSlug,
    };
    next();
  });

  app.get('/locations/geocode', (req, res, next) =>
    core.services
      .geocoder(req.query.address, {
        countryCode: req.query.countryCode,
        language: req.lang || 'fr',
      })
      .then((results) => res.send({ results }), next));

  app.get('/locations/geocode/reverse', (req, res, next) =>
    core.services.geocoder
      .reverse(req.query.latitude, req.query.longitude, {
        language: req.lang || 'fr',
      })
      .then((results) => res.send({ results }), next));

  app.get('/locations/insee', (req, res, next) =>
    core.services.agendaLocations.utils
      .getINSEECode(
        _.pick(req.query, ['city', 'department', 'latitude', 'longitude']),
      )
      .then((code) => res.json({ code }), next));

  app.get(
    '/agendas/:agendaUid/locations/:locationUid/activities',
    mw.member.allow(['contributor', 'moderator', 'administrator']),
    async (req, res, next) => {
      try {
        const activities = await app.services.activities
          .feed({ entityType: 'user', entityUid: req.user.uid })
          .activities.list(
            { object: `location:${req.params.locationUid}` },
            req.query.fromId || 0,
            20,
          );

        res.json({
          activities,
          config: req.query.withConfig
            ? app.services.activities.getFormatConfig()
            : undefined,
        });
      } catch (e) {
        next(e);
      }
    },
  );

  app.get('/agendas/:agendaUid/locations/settings', (req, res, next) =>
    core
      .agendas(req.agenda.uid)
      .locations.settings.get({ includeSetInfo: req.query.includeSetInfo })
      .then((resp) => res.json(resp), next));

  app.post('/agendas/:agendaUid/locations/merge', [
    mw.member.allow(['administrator', 'moderator']),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .locations.merge(req.body.mergeIn, { uids: req.body.merged }, null, {
          context: {
            userUid: req.user.uid,
          },
        })
        .then(
          (location) =>
            res.json({
              location,
              success: true,
            }),
          next,
        ),
  ]);

  app.get(
    [
      '/agendas/:agendaUid/locations/:locationUid',
      '/agendas/:agendaUid/locations/ext/:locationExtValue',
      '/agendas/:agendaUid/locations/ext/:locationExtKey/:locationExtValue',
      '/agendas/:agendaUid/locations/slug/:locationSlug',
    ],
    [
      (req, res, next) =>
        core
          .agendas(req.agenda.uid)
          .locations.get(req.locationIdentifier, {
            access: req.access,
            throwOnNotFound: req.method === 'HEAD',
            includeFields: req.method === 'HEAD' ? ['uid'] : [],
            deleted: boolQuery(req.query.deleted, { nullable: true }),
          })
          .then(
            (location) =>
              (req.method === 'HEAD'
                ? res.send()
                : res.json({
                  success: true,
                  location,
                })),
            next,
          ),
    ],
  );

  app.post(
    '/agendas/:agendaUid/locations/:locationUid/transfer/:targetAgendaUid',
    [
      mw.member.allow(['administrator', 'moderator']),
      (req, res, next) =>
        core
          .agendas(req.agenda.uid)
          .locations.transfer(
            parseInt(req.params.locationUid, 10),
            parseInt(req.params.targetAgendaUid, 10),
            {
              context: {
                userUid: req.user.uid,
              },
            },
          )
          .then(
            (location) =>
              res.json({
                success: true,
                location,
              }),
            next,
          ),
    ],
  );

  app.post(
    [
      '/agendas/:agendaUid/locations/:locationUid',
      '/agendas/:agendaUid/locations/ext/:locationExtValue',
      '/agendas/:agendaUid/locations/ext/:locationExtKey/:locationExtValue',
    ],
    [
      mw.member.allow(['administrator', 'moderator']),
      (req, res, next) =>
        core
          .agendas(req.agenda.uid)
          .locations.update(req.locationIdentifier, req.parsedData, {
            autocomplete: (req.query.autocomplete ?? '1') === '1',
            context: {
              userUid: req.user.uid,
            },
          })
          .then(
            (location) =>
              res.json({
                success: true,
                location,
              }),
            next,
          ),
    ],
  );

  app.put(
    [
      '/agendas/:agendaUid/locations/ext/:locationExtValue',
      '/agendas/:agendaUid/locations/ext/:locationExtKey/:locationExtValue',
    ],
    [
      mw.allowLocationSetWithContributorCreate(core),
      (req, res, next) =>
        core
          .agendas(req.agenda.uid)
          .locations.set(req.locationIdentifier, req.parsedData, {
            autocomplete: (req.query.autocomplete ?? '1') === '1',
            /* mergeExtIds: boolQuery(req.query.mergeExtIds, { defaultValue: true }), */
            context: {
              userUid: req.user.uid,
            },
          })
          .then(
            (location) =>
              res.json({
                success: true,
                location,
              }),
            next,
          ),
    ],
  );

  app.patch(
    [
      '/agendas/:agendaUid/locations/:locationUid',
      '/agendas/:agendaUid/locations/ext/:locationExtValue',
      '/agendas/:agendaUid/locations/ext/:locationExtKey/:locationExtValue',
    ],
    [
      mw.member.allow(['administrator', 'moderator']),
      (req, res, next) =>
        core
          .agendas(req.agenda.uid)
          .locations.patch(req.locationIdentifier, req.parsedData, {
            autocomplete: (req.query.autocomplete ?? '1') === '1',
            /* mergeExtIds: boolQuery(req.query.mergeExtIds, { defaultValue: true }), */
            context: {
              userUid: req.user.uid,
            },
          })
          .then(
            (location) =>
              res.json({
                success: true,
                location,
              }),
            next,
          ),
    ],
  );

  app.delete(
    [
      '/agendas/:agendaUid/locations/:locationUid',
      '/agendas/:agendaUid/locations/ext/:locationExtValue',
      '/agendas/:agendaUid/locations/ext/:locationExtKey/:locationExtValue',
    ],
    [
      mw.member.allow(['administrator', 'moderator']),
      (req, res, next) =>
        core
          .agendas(req.agenda.uid)
          .locations.remove(req.locationIdentifier, {
            context: {
              userUid: req.user.uid,
            },
            removeEvents: !!req.query.withEvents,
          })
          .then(
            (location) =>
              res.json({
                success: true,
                location,
              }),
            next,
          ),
    ],
  );

  app.get(
    '/agendas/:agendaUid/locations',
    track.mw('api', 'list', 'locations'),
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .locations.list(req.query, req.query, {
          useAfter: !req.query.from || !!req.query.after,
          eventCounts: !!req.query.eventCounts,
          itemsKey: req.query.itemsKey ?? 'locations',
        })
        .then(
          ({ items, total, after }) =>
            res.json({
              success: true,
              after,
              total,
              [req.query.itemsKey ?? 'locations']: items,
            }),
          next,
        ),
  );

  app.post('/agendas/:agendaUid/settings/resync', [
    mw.member.allow(['administrator'], {
      or: allowSuperAdmin({ redirect: false }),
    }),
    settings.resync,
  ]);

  app.get('/agendas/:agendaUid/summary', [
    mw.member.load,
    track.mw('api', 'get', 'summary'),
    (req, res, next) => {
      // Handle both array format (?includes[]=value) and comma-separated string (?includes=value1,value2)
      let includes = [];
      if (req.query.includes) {
        if (Array.isArray(req.query.includes)) {
          includes = req.query.includes.filter(Boolean);
        } else if (
          typeof req.query.includes === 'string'
          && req.query.includes.trim()
        ) {
          includes = req.query.includes
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      core
        .agendas(req.agenda.uid)
        .summary({
          access: req.access,
          includes,
        })
        .then((summary) => res.json({ success: true, summary }), next);
    },
  ]);

  app.get('/me', (req, res, next) => {
    if (!req.user) {
      res.json({ logged: false });
    } else {
      core.users.get(req.user.uid, { detailed: true }).then(
        (user) =>
          res.json({
            logged: true,
            ..._.pick(user, ['apiKey']),
          }),
        next,
      );
    }
  });

  app.delete('/me', (req, res, next) => {
    if (!req.user) {
      return next(new NotAuthenticated('Authentication is required'));
    }
    core
      .users(req.user.uid)
      .remove()
      .then(() => {
        if (core.services.sessions) {
          core.services.sessions.mw.close();
        }
        res.json({
          success: true,
        });
      });
  });

  app.get('/me/agendas', [
    mw.rejectAgendaKey,
    (req, res, next) =>
      core
        .users(req.user)
        .agendas.list(req.query)
        .then((data) => res.json({ ...data, success: true }), next),
  ]);

  app.get('/me/agendas/:agendaUid', [
    mw.rejectAgendaKey,
    mw.member.load,
    (req, res, next) => {
      if (!req.user) {
        return next(new NotAuthenticated('Authentication is required'));
      }
      core
        .users(req.user.uid)
        .agendas(req.params.agendaUid)
        .getContext({
          userUid: req.user.uid,
          includes: req.query.includes,
          relation: ['contributed', 'owned'],
        })
        .then((context) => res.json(context), next);
    },
  ]);

  app.get('/me/agendas/:agendaUid/events', [
    mw.rejectAgendaKey,
    mw.member.load,
    (req, res, next) => {
      if (!req.user) {
        return next(new NotAuthenticated('Authentication is required'));
      }
      core
        .users(req.user.uid)
        .agendas(req.params.agendaUid)
        .events.search(
          {
            ...req.query,
            relation: ['contributed', 'owned'],
          },
          req.query,
          {
            useAfterKey: true,
            userUid: req.user?.uid,
          },
        )
        .then(
          (result) =>
            res.json({
              success: true,
              ...result,
            }),
          next,
        );
    },
  ]);

  app.get('/me/agendas/:agendaUid/events/drafts', [
    mw.rejectAgendaKey,
    mw.member.load,
    (req, res, next) => {
      if (!req.user) {
        return next(new NotAuthenticated('Authentication is required'));
      }
      core
        .users(req.user.uid)
        .agendas(req.params.agendaUid)
        .events.drafts(
          {
            useDefaultImage:
              req.query.useDefaultImage && req.query.useDefaultImage === '1',
          },
          req.query,
        )
        .then(
          (result) =>
            res.json({
              success: true,
              events: result.items,
              total: result.total,
            }),
          next,
        );
    },
  ]);

  app.get('/me/agendas/:agendaUid/events/:eventUid', [
    mw.rejectAgendaKey,
    mw.member.load,
    (req, res, next) => {
      if (!req.user) {
        return next(new NotAuthenticated('Authentication is required'));
      }
      core
        .users(req.user.uid)
        .agendas(req.params.agendaUid)
        .events(req.params.eventUid)
        .getContext({ userUid: req.user.uid })
        .then((context) => res.json(context), next);
    },
  ]);

  app.get('/agendas', mw.extractIncludeFields, (req, res, next) => {
    core.agendas
      .search(req.query, req.query, {
        useDefaultImage:
          req.query.useDefaultImage && req.query.useDefaultImage === '1',
        includeImagePath: !(
          req.query.includeImagePath && req.query.includeImagePath === '0'
        ),
        includeFields: req.includeFields,
      })
      .then((data) => res.json({ ...data, success: true }), next);
  });

  app.post('/networks', [
    allowSuperAdmin({ jsonResponse: true }),
    (req, res, next) =>
      core.networks
        .create(req.parsedData, { userUid: req.user.uid })
        .then((network) => res.json(network), next),
  ]);

  app.get('/networks/:uid', (req, res, next) => {
    core
      .networks(req.params.uid)
      .get()
      .then((network) => res.json(_.pick(network, ['uid', 'title'])), next);
  });

  app.post('/networks/:uid/agendas', [
    allowSuperAdmin({ jsonResponse: true }),
    (req, res, next) =>
      core
        .networks(req.params.uid)
        .agendas.create(
          { title: req.body.title, description: req.body.description },
          { userUid: req.user.uid },
        )
        .then((agenda) => res.json(agenda), next),
  ]);

  app.get('/networks/:uid/settings/eventSchema/configure', [
    allowSuperAdmin({ jsonResponse: true }),
    (req, res, next) =>
      core
        .networks(req.params.uid)
        .schema.getAndParents({
          lang: req.lang || req.query.lang || 'fr',
        })
        .then((data) => res.json({ ...data }), next),
  ]);

  app.post('/networks/:uid/settings/eventSchema/configure', [
    allowSuperAdmin({ jsonResponse: true }),
    (req, res, next) =>
      core
        .networks(req.params.uid)
        .schema.updateFields(req.parsedData.fields)
        .then((updatedSchema) => res.json(updatedSchema), next),
  ]);

  app.get('/locationSets/:uid', (req, res, next) => {
    core
      .locationSets(req.params.uid)
      .get()
      .then(
        (locationSet) => res.json(_.pick(locationSet, ['uid', 'title'])),
        next,
      );
  });

  app.get('/events', [
    verifyTransverseApiAccess,
    (req, res, next) => {
      core.events
        .search(req.query, req.query, {
          useDefaultImage:
            req.query.useDefaultImage && req.query.useDefaultImage === '1',
          includeFields: req.query.includeFields ?? req.query.if,
          detailed: req.query.detailed,
          monolingual: req.query.monolingual,
          includeImageTimestamp: req.query.includeImageTimestamp,
          includeLocationImagePath: req.query.includeLocationImagePath,
          useAfterKey: true,
          removed: boolQuery(req.query.removed, { nullable: true }),
          aggregations: req.query.aggs ?? req.query.aggregations,
        })
        .then((data) => {
          const response = JSON.stringify({ ...data, success: true });
          req.result = data;
          req.contentLength = Buffer.byteLength(response, 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.send(response);
          next();
        }, next);
    },
    ...app.services.usageCounters
      ? [app.services.usageCounters.mw.increment('transverseEvents')]
      : [],
    (_req, res, next) => {
      if (!res.headersSent) next();
    },
  ]);

  app.get('/supervisor/users/:uid', [
    allowSuperAdmin({ jsonResponse: true }),
    (req, res) =>
      core.users
        .get(req.params.uid, {
          withSchema: true,
          includeSupervisorLink: true,
        })
        .then((result) => res.json(result)),
  ]);

  app.get('/noop', (req, res) => res.send());

  log('done');

  app.use(sentryErrorHandler({ tag: 'api' }));
  app.use(apiErrorHandler);

  app.use((_req, res) => {
    res.status(404).json({
      info: 'Unhandled route',
    });
  });

  return app;
};
