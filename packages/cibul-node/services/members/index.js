'use strict';

const _ = require('lodash');

const Service = require('@openagenda/members');
const log = require('@openagenda/logs')('services/members');

const sessions = require('../sessions');
const mail = require('./lib/mail');
const activities = require('./lib/activities');
const streamCsv = require('./lib/streamCsv');
const streamXlsx = require('./lib/streamXlsx');
const transferEvent = require('./lib/transferEvent');

const getEventCountByUserUid = require('./getEventCountByUserUid');
const getUsersByUid = require('./getUsersByUid');
const getUserByEmail = require('./getUserByEmail');
const getAgendasByUid = require('./getAgendasByUid');
const onCreate = require('./onCreate');
const onRemove = require('./onRemove');
const onPatch = require('./onPatch');

const mw = require('./middleware');

const members = {};
const config = {};

function init(c, services) {
  Object.assign(config, c);

  const {
    queues,
  } = services;

  const activityQueue = queues('memberActivities');
  const messageQueue = queues('memberMessages');

  Object.assign(members, Service({
    knex: config.knex,
    schema: 'reviewer',
    queues,
    bulkThreshold: 10,
    logger: config.getLogConfig('svc', 'members'),
    interfaces: {
      getEventCountByUserUid: getEventCountByUserUid.bind(null, services),
      getUsersByUid: getUsersByUid.bind(null, services),
      getUserByEmail: getUserByEmail.bind(null, services),
      getAgendasByUid: getAgendasByUid.bind(null, services),
      onCreate: onCreate.bind(null, { services, config, activityQueue }),
      onRemove: onRemove.bind(null, { services, members, activityQueue }),
      onPatch: onPatch.bind(null, { services, config, activityQueue })
    },
  }));

  const messages = mail.messages(config, {
    members,
    queue: messageQueue,
  });

  const {
    task: activityTask,
  } = activities({ queue: activityQueue });

  mw.sendMessage.init(messages);

  return Object.assign(
    module.exports,
    members,
    {
      task: () => {
        log('running tasks');
        members.task();
        messages.task();
        activityTask();
      },
      mw: {
        load: mw.load,
        loadOrFail: mw.load.orFail,
        loadOr: mw.load.or,
        list: mw.list.bind(null, members),
        loadAndAuthorize: mw.load.andAuthorize,
        authorizeAdminModOrEventOwner: mw.authorize.adminModOrEventOwner,
        authorizeAdminModOrKey: mw.authorize.adminModOrKey,
        loadTarget: Object.assign(mw.loadTarget.bind(null, members), {
          options: mw.loadTarget.options.bind(null, members),
        }),
      },
    }
  );
}

function plugApp(app) {
  const { agendas } = app.services;

  app.all([
    '/:agendaSlug/admin/members',
    '/:agendaSlug/admin/members.:format',
    '/:agendaSlug/admin/members/stats',
    '/:agendaSlug/admin/members/invite',
    '/:agendaSlug/admin/members/send-message',
    '/:agendaSlug/admin/members/:id',
    '/:agendaSlug/admin/members/:id/details',
    '/:agendaSlug/admin/members/:id/invite/resend',
  ], [
    mw.loadAgenda,
    agendas.mw.authorizeByIPAddress(),
    sessions.mw.loadOrRedirect(),
    mw.load.andAuthorize('moderator'),
    agendas.mw.authorizeByIPAddress(),
  ]);

  app.get(
    '/:agendaSlug/admin/members.:format',
    (req, res, next) => {
      req.order = 'actionsCounter.desc';
      next();
    }
  );

  app.get(
    '/:agendaSlug/admin/members.json',
    (req, res, next) => {
      req.order = req.query.order || req.order;
      next();
    },
    mw.list.bind(null, members)
  );

  app.get(
    '/:agendaSlug/admin/members/stats',
    mw.list.stats.bind(null, members)
  );

  app.get([
    '/:agendaSlug/admin/members.csv',
    '/:agendaSlug/admin/members.xlsx',
  ], mw.spreadsheet.stream);

  app.post(
    '/:agendaSlug/admin/members/invite',
    mw.authorize.moderatorCannotInviteAdministrator,
    mw.loadContext,
    mw.invite.bind(null, members)
  );

  app.post(
    '/:agendaSlug/admin/members/send-message',
    mw.authorize.agendaHasCredential.bind(null, 'invitationMessage'),
    mw.sendMessage
  );

  // keep 'details' part as long as there are controllers in agenda/members.back.js
  app.get(
    '/:agendaSlug/admin/members/:id/details',
    mw.loadTarget.options.bind(null, members, { detailed: true }),
    (req, res) => res.json({
      ..._.pick(req.targetMember, [
        'id',
        'role',
        'userUid',
        'custom',
      ]),
      user: _.pick(req.targetMember.user, ['uid', 'fullName']),
    })
  );

  app.delete(
    '/:agendaSlug/admin/members/:id',
    mw.loadTarget.bind(null, members),
    mw.authorize.moderatorCannotEditAdministrator,
    (req, res, next) => members.remove(req.targetMember.id, {
      context: { user: req.user },
    }).then(() => {
      res.status(200).json({ message: 'done.' });
    }, next)
  );

  app.patch(
    '/:agendaSlug/admin/members/:id',
    mw.loadTarget.bind(null, members),
    mw.authorize.moderatorCannotEditAdministrator,
    mw.loadContext,
    (req, res, next) => members.patch(req.targetMember.id, req.body, {
      context: req.context,
      requireCustom: false,
    }).then(result => {
      res.status(200).json(_.pick(result.member, ['custom', 'role']));
    }, next)
  );

  app.put(
    '/:agendaSlug/admin/members/:id/invite/resend',
    mw.loadContext,
    mw.loadTarget.bind(null, members),
    (req, res, next) => {
      members.set.byEmail({
        agendaUid: req.agenda.uid,
        email: req.targetMember.custom.email,
      }, { context: req.context }).then(({
        member,
      }) => {
        if (member && member.userUid) {
          return res.status(200).json({
            message: 'user is member',
          });
        }
        next();
      }, next);
    },
    (req, res, next) => mail.resendInvitation({
      services: req.app.services,
      config,
    }, {
      agenda: req.agenda,
      member: req.targetMember,
    }).then(() => res.status(200).json({ message: 'pabim.' }), next)
  );

  // should be put
  app.post(
    '/:agendaSlug/admin/members/transfer/:eventSlug',
    mw.loadAgenda,
    mw.loadEvent,
    mw.load,
    mw.authorize.adminModOrEventOwner,
    mw.authorize.agendaHasCredential.bind(null, 'eventOwnershipTransfer'),
    mw.loadTarget.byEmail.bind(null, members),
    (req, res, next) => transferEvent(req.app.services, req.event, req.targetMember).then(() => {
      res.redirect(302, `/${req.agenda.slug}/events/${req.event.slug}`);
    }, next)
  );

  app.get('/:agendaSlug/admin/members.csv', streamCsv);
  app.get('/:agendaSlug/admin/members.xlsx', streamXlsx);
}

module.exports = Object.assign(plugApp, {
  init,
  utils: Service.utils,
});
