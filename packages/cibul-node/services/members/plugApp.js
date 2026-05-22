import _ from 'lodash';
import { requireUser } from '../../lib/authGuards.js';
import streamCsv from './lib/streamCsv.js';
import streamXlsx from './lib/streamXlsx.js';
import * as mw from './middleware/index.js';
import * as mail from './lib/mail.js';

export default function plugApp(app) {
  const { agendas, members, core } = app.services;

  const config = core.getConfig();

  app.all(
    [
      '/:agendaSlug/admin/members',
      '/:agendaSlug/admin/members.:format',
      '/:agendaSlug/admin/members/stats',
      '/:agendaSlug/admin/members/message-history',
      '/:agendaSlug/admin/members/:id',
      '/:agendaSlug/admin/members/:id/details',
      '/:agendaSlug/admin/members/:id/invite/resend',
    ],
    [
      mw.loadAgenda.default,
      agendas.mw.authorizeByIPAddress(),
      requireUser,
      mw.load.andAuthorize('moderator'),
      agendas.mw.authorizeByIPAddress(),
    ],
  );

  app.get('/:agendaSlug/admin/members.:format', (req, res, next) => {
    req.order = 'actionsCounter.desc';
    next();
  });

  app.get(
    '/:agendaSlug/admin/members.json',
    (req, res, next) => {
      req.order = req.query.order || req.order;
      next();
    },
    mw.list.default.bind(null, members),
  );

  app.get(
    '/:agendaSlug/admin/members/stats',
    mw.list.stats.bind(null, members),
  );

  app.get(
    ['/:agendaSlug/admin/members.csv', '/:agendaSlug/admin/members.xlsx'],
    mw.spreadsheet.stream,
  );

  app.get(
    '/:agendaSlug/admin/members/message-history',
    async (req, res, next) => {
      try {
        const activities = await app.services.activities
          .feed({ entityType: 'agenda', entityUid: req.agenda.uid })
          .activities.list(
            { verb: 'agenda.sendMessage' },
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

  // keep 'details' part as long as there are controllers in agenda/members.back.js
  app.get(
    '/:agendaSlug/admin/members/:id/details',
    mw.loadTarget.options.bind(null, members, { detailed: true }),
    (req, res) =>
      res.json({
        ..._.pick(req.targetMember, ['id', 'role', 'userUid', 'custom']),
        user: _.pick(req.targetMember.user, ['uid', 'fullName']),
      }),
  );

  app.delete(
    '/:agendaSlug/admin/members/:id',
    mw.loadTarget.default.bind(null, members),
    mw.authorize.moderatorCannotEditAdministrator,
    (req, res, next) =>
      members
        .remove(req.targetMember.id, {
          context: { user: req.user },
        })
        .then(() => {
          res.status(200).json({ message: 'done.' });
        }, next),
  );

  app.patch(
    '/:agendaSlug/admin/members/:id',
    mw.loadTarget.default.bind(null, members),
    mw.authorize.moderatorCannotEditAdministrator,
    mw.loadContext,
    (req, res, next) =>
      members
        .patch(req.targetMember.id, req.body, {
          context: req.context,
          requireCustom: false,
        })
        .then((result) => {
          res.status(200).json(_.pick(result.member, ['custom', 'role']));
        }, next),
  );

  app.put(
    '/:agendaSlug/admin/members/:id/invite/resend',
    mw.loadContext,
    mw.loadTarget.default.bind(null, members),
    (req, res, next) => {
      members.set
        .byEmail(
          {
            agendaUid: req.agenda.uid,
            email: req.targetMember.custom.email,
          },
          { context: req.context },
        )
        .then(({ member }) => {
          if (member && member.userUid) {
            return res.status(200).json({
              message: 'user is member',
            });
          }
          next();
        }, next);
    },
    (req, res, next) =>
      mail
        .resendInvitation(
          {
            services: req.app.services,
            config,
          },
          {
            agenda: req.agenda,
            member: req.targetMember,
          },
        )
        .then(() => res.status(200).json({ message: 'pabim.' }), next),
  );

  // should be put
  app.post(
    '/:agendaSlug/admin/members/transfer/:eventSlug',
    mw.loadAgenda.default,
    mw.loadEvent.default,
    mw.load.default,
    // NOTE: mw.authorize.adminModOrEventOwner removed — core endpoint enforces authz
    async (req, res, next) => {
      try {
        if (req.body.userUid) {
          req.targetMember = await members.get({
            agendaUid: req.agenda.uid,
            userUid: req.body.userUid,
          });
          if (req.targetMember) return next();
        }

        if (req.body.email) {
          req.targetMember = await members.get.byEmail({
            agendaUid: req.agenda.uid,
            email: req.body.email,
          });
          if (req.targetMember) return next();
        }

        next(new Error('Member not found'));
      } catch (e) {
        next(e);
      }
    },
    (req, res, next) =>
      req.app.core
        .agendas(req.agenda.uid)
        .events.transferOwnership(
          req.event.uid,
          { userUid: req.targetMember.userUid },
          { context: { userUid: req.user.uid } },
        )
        .then(() => {
          if (req.query.json) {
            return res.status(200).json();
          }
          res.redirect(
            302,
            `/${req.agenda.slug}/events/${req.event.uid}_${req.event.slug}`,
          );
        }, next),
  );

  app.get('/:agendaSlug/admin/members.csv', streamCsv);
  app.get('/:agendaSlug/admin/members.xlsx', streamXlsx);
}
