import cmn from '../../lib/commons-app.js';
import { requireUser } from '../../lib/authGuards.js';
import searchMembers from './middlewares/searchMembers.js';
import LoadUser from './middlewares/LoadUser.js';
import getUsers from './middlewares/getUsers.js';
import userSignin from './middlewares/userSignin.js';
import userActivate from './middlewares/userActivate.js';
import userBlacklist from './middlewares/userBlacklist.js';
import userUpdate from './middlewares/userUpdate.js';
import getAgenda from './middlewares/getAgenda.js';
import sendAgenda from './middlewares/sendAgenda.js';
import searchAgendas from './middlewares/searchAgendas.js';
import toggleAggregationFeature from './middlewares/toggleAggregationFeature.js';
import userChangePassword from './middlewares/userChangePassword.js';

function plugApp(services, app, base = '/admin') {
  const { users, core, redis } = services;

  const pre = [
    cmn.loadBaseData('oa-admin.css'),
    requireUser,
    users.mw.allowSuperAdmin(),
  ];

  const loadUserFromBody = LoadUser('post');
  const loadUserFromQuery = LoadUser('get');

  app.use(base, pre);

  app.get(`${base}`, (req, res) =>
    res.send(
      '<a href="/admin/agendas">Agendas</a> - <a href="/admin/users">Users</a>',
    ));
  app.get(`${base}/users`, getUsers, async (req, res) =>
    cmn.render(req, res, 'admin/users', {
      accountActivationMode:
        await redis.get('accountActivationMode') ?? 'manual',
    }));
  app.get(`${base}/users/signin`, loadUserFromQuery, userSignin);
  app.get(
    `${base}/users/activate`,
    loadUserFromQuery,
    userActivate.bind(null, base),
  );
  app.get(
    `${base}/users/blacklist`,
    loadUserFromQuery,
    userBlacklist.bind(null, base),
  );
  app.post(`${base}/users/update`, loadUserFromBody, userUpdate);
  app.get(`${base}/users/activationMode`, (req, res, next) =>
    redis
      .set('accountActivationMode', req.query.mode)
      .then(() => res.redirect(`${base}/users`), next));
  app.get(`${base}/users/changePassword`, userChangePassword);

  app.get(`${base}/agendas`, (req, res) =>
    cmn.render(req, res, 'admin/agendas', req.templateData));
  app.get(`${base}/agendas/search`, searchAgendas);
  app.get(`${base}/agendas/:uid`, getAgenda, sendAgenda);
  app.post(
    `${base}/agendas/:uid`,
    getAgenda,
    toggleAggregationFeature,
    (req, res, next) =>
      core
        .agendas(req.agenda.uid)
        .update(req.body, {
          access: 'internal',
          internal: true,
          protected: false,
          private: null,
          context: { user: req.user },
        })
        .then((agenda) => {
          req.agenda = agenda;
          next();
        }, next),
    sendAgenda,
  );
  app.get(`${base}/agendas/members/search`, searchMembers);

  // Lets a superadmin add themselves as administrator of any agenda. The
  // `allowSuperAdmin` guard above already gates the whole `${base}` namespace,
  // and access: 'internal' bypasses the per-agenda membership check in
  // members.create. Idempotent: a superadmin already a member gets a clean
  // alreadyMember response instead of an "Already exists" error.
  app.post(`${base}/agendas/:uid/members/me`, getAgenda, (req, res, next) =>
    core
      .agendas(req.agenda.uid)
      .members.create(req.user.uid, 'administrator', null, {
        userUid: req.user.uid,
        access: 'internal',
        context: { user: req.user },
      })
      .then(
        (member) => res.json({ success: true, member }),
        (error) => {
          // members.create wraps the duplicate-key error as a BadRequest whose
          // (VError-concatenated) message contains 'Already exists'.
          if (
            error.name === 'BadRequest'
            && error.message.includes('Already exists')
          ) {
            return res.json({ success: true, alreadyMember: true });
          }
          return next(error);
        },
      ));
}

export function init(config, services) {
  return {
    plugApp: plugApp.bind(null, services),
  };
}
