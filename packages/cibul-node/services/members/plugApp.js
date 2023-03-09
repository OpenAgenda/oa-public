'use strict';

const _ = require('lodash');

const streamCsv = require('./lib/streamCsv');
const streamXlsx = require('./lib/streamXlsx');
const transferEvent = require('./lib/transferEvent');
const mw = require('./middleware');
const mail = require('./lib/mail');

module.exports = function plugApp(app) {
  const {
    agendas,
    sessions,
    members,
    core,
  } = app.services;

  const config = core.getConfig();

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
    },
  );

  app.get(
    '/:agendaSlug/admin/members.json',
    (req, res, next) => {
      req.order = req.query.order || req.order;
      next();
    },
    mw.list.bind(null, members),
  );

  app.get(
    '/:agendaSlug/admin/members/stats',
    mw.list.stats.bind(null, members),
  );

  app.get([
    '/:agendaSlug/admin/members.csv',
    '/:agendaSlug/admin/members.xlsx',
  ], mw.spreadsheet.stream);

  app.post(
    '/:agendaSlug/admin/members/invite',
    mw.authorize.moderatorCannotInviteAdministrator,
    mw.loadContext,
    mw.invite.bind(null, members),
  );

  app.post(
    '/:agendaSlug/admin/members/send-message',
    mw.authorize.agendaHasCredential.bind(null, 'invitationMessage'),
    mw.sendMessage,
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
    }),
  );

  app.delete(
    '/:agendaSlug/admin/members/:id',
    mw.loadTarget.bind(null, members),
    mw.authorize.moderatorCannotEditAdministrator,
    (req, res, next) => members.remove(req.targetMember.id, {
      context: { user: req.user },
    }).then(() => {
      res.status(200).json({ message: 'done.' });
    }, next),
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
    }, next),
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
    }).then(() => res.status(200).json({ message: 'pabim.' }), next),
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
    }, next),
  );

  app.get('/:agendaSlug/admin/members.csv', streamCsv);
  app.get('/:agendaSlug/admin/members.xlsx', streamXlsx);
};
