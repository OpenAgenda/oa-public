import _ from 'lodash';
import logs from '@openagenda/logs';
import agendasSvc from '@openagenda/agendas';
import cmn from '../lib/commons-app.js';
import membersSvc from '../services/members/index.js';
import config from '../config/index.js';

const log = logs('admin/back');

const PreMw = ({ sessions, users }) => [
  cmn.loadBaseData('oa-admin.css'),
  sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
  users.mw.allowSuperAdmin(),
];

function index(req, res) {
  log('rendering index');

  res.send(
    '<html><body><a href="/admin/agendas">Agendas</a> - <a href="/admin/users">Users</a></body></html>',
  );
}

function userChangePassword({ app, query }, res) {
  const { users: usersSvc } = app.services;
  const { uid, password } = query;

  usersSvc
    .changePassword(uid, { password })
    .then(() => {
      res.json({ success: true });
    })
    .catch(() => {
      res.json({ success: false });
    });
}

async function userActivate(req, res, next) {
  const { users: usersSvc, mails } = req.app.services;

  if (!req.loadedUser.isActivated) {
    try {
      req.loadedUser = await usersSvc.patch(
        req.loadedUser.uid,
        { isActivated: true },
        { internal: true },
      );

      await mails.send({
        template: 'activatedAccount',
        to: req.loadedUser.email,
        lang: req.loadedUser.culture,
        data: {
          activateLink: config.root,
        },
        queue: false,
      });

      if (req.accepts(['json', 'html']) === 'html') {
        return res.redirect(`/admin/users?userUid=${req.loadedUser.uid}`);
      }

      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  }

  if (req.accepts(['json', 'html']) === 'html') {
    return res.redirect(`/admin/users?userUid=${req.loadedUser.uid}`);
  }

  return res.json({ success: false });
}

async function toggleActivationMode({ app, query }, res) {
  const { redis } = app.services;

  try {
    await redis.set('accountActivationMode', query.mode);
  } catch (e) {
    /* e */
  }
  return res.redirect('/admin/users');
}

async function userBlacklist(req, res, next) {
  const { users: usersSvc, sessions } = req.app.services;

  const userUid = req.loadedUser.uid;

  try {
    const isBlacklisted = _.get(req.query, 'isBlacklisted', 'true') === 'true';

    req.loadedUser = await usersSvc.patch(
      userUid,
      { isBlacklisted },
      { internal: true },
    );

    if (isBlacklisted) {
      await sessions.close.byUid(userUid);
    }
  } catch (err) {
    return next(err);
  }

  if (req.accepts(['json', 'html']) === 'html') {
    return res.redirect(`/admin/users?userUid=${req.loadedUser.uid}`);
  }

  return res.json({ success: true });
}

function userUpdate({ app, loadedUser, body }, res, next) {
  const { users: usersSvc } = app.services;

  usersSvc
    .get(loadedUser.uid, { detailed: true, removed: null })
    .then(async ({ uid }) => {
      if (body.enable_secret === 'true') {
        await usersSvc.generateApiKey(
          uid,
          {
            secretKey: true,
          },
          { removed: null },
        );
      }

      const patchedData = {};

      if (body.enable_secret !== undefined) {
        patchedData.store = { enable_secret: body.enable_secret === 'true' };
      }

      if (body.transverseApiAccess) {
        patchedData.transverseApiAccess = body.transverseApiAccess === 'true';
      }

      const respUser = await usersSvc.patch(uid, patchedData, {
        detailed: true,
        removed: null,
        internal: true,
      });

      res.json({
        success: true,
        user: respUser,
      });
    })
    .catch(next);
}

function userSignin(req, res) {
  const { sessions } = req.app.services;

  sessions.open(req, res, req.loadedUser, () => {
    if (req.xhr) return cmn.renderJson(req, res, { success: true });

    return res.redirect(302, '/home');
  });
}

function _loadUser(type = 'get') {
  return (req, res, next) => {
    const { users: usersSvc } = req.app.services;

    const request = req[type === 'get' ? 'query' : 'body'];

    if (!request.uid) {
      return cmn.renderJson(req, res, {
        success: false,
        message: 'user uid is missing',
      });
    }

    const { uid } = request;

    usersSvc
      .get(uid, { removed: null, detailed: true })
      .then((user) => {
        req.loadedUser = user;

        next();
      })
      .catch(cmn.catchError(req, res));
  };
}

function _searchUsers(req, res) {
  const { knex } = req.app.services;
  const perPage = 40;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;

  const k = knex('user').where('is_removed', 0);

  if (req.query.search) {
    k.where('email', 'like', `%${req.query.search}%`)
      .orWhere('full_name', 'like', `%${req.query.search}%`)
      .orWhere('uid', req.query.search);
  }

  k.clone()
    .count('id as total')
    .then(([{ total }]) =>
      k
        .select()
        .offset((page - 1) * perPage)
        .limit(perPage)
        .then((rows) => ({
          total,
          users: rows.map(
            ({ uid, full_name: fullName, email, is_removed: isRemoved }) => ({
              uid,
              fullName,
              email,
              isRemoved,
            }),
          ),
          page,
          perPage,
        })))
    .then((response) => cmn.renderJson(req, res, response))
    .catch((err) => {
      cmn.catchError(req, res)(err);
    });
}

async function getUsers(req, res, next) {
  const { redis, knex } = req.app.services;

  if (req.xhr) {
    if (req.query.uid) {
      return _loadUser()(req, res, () => {
        if (!req.loadedUser.id) return next(new Error('User not found'));

        membersSvc
          .list(
            { userUid: req.loadedUser.uid },
            { limit: 1000, order: 'id.desc' },
            { userOptions: { detailed: true } },
          )
          .then((members) => {
            agendasSvc.list(
              {
                uid: members.map(({ agendaUid }) => agendaUid),
              },
              0,
              1000,
              { private: null },
              (err, agendas) => {
                knex('agenda_event')
                  .select(
                    knex.raw('count(*) as nbrEvents'),
                    'agenda_uid as agendaUid',
                  )
                  .where('user_uid', req.loadedUser.uid)
                  .groupBy('agenda_uid')
                  .then((counters) => {
                    // eslint-disable-next-line no-param-reassign
                    members = members.map((member) => {
                      [member.agenda] = agendas.filter(
                        ({ uid }) => uid === member.agendaUid,
                      );

                      const counter = counters.filter(
                        ({ agendaUid }) => agendaUid === member.agendaUid,
                      )[0];
                      member.nbrEvents = counter && counter.nbrEvents;

                      return member;
                    });

                    cmn.renderJson(req, res, {
                      user: req.loadedUser,
                      members,
                    });
                  });
              },
            );
          });
      });
    }
    return _searchUsers(req, res);
  }

  cmn.render(req, res, 'admin/users', {
    accountActivationMode:
      await redis.get('accountActivationMode') ?? 'manual',
  });
}

export default (app) => {
  const preMw = PreMw(app.services);

  app.get('/admin', preMw, index);
  app.get('/admin/users', preMw, getUsers);
  app.get('/admin/users/signin', preMw, _loadUser(), userSignin);
  app.get('/admin/users/activate', preMw, _loadUser(), userActivate);
  app.get('/admin/users/blacklist', preMw, _loadUser(), userBlacklist);
  app.post('/admin/users/update', preMw, _loadUser('post'), userUpdate);
  app.get('/admin/users/activationMode', preMw, toggleActivationMode);
  app.get('/admin/users/changePassword', preMw, userChangePassword);
};
