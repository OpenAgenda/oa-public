import { promisify } from 'node:util';
import _ from 'lodash';
import moment from 'moment';
import logs from '@openagenda/logs';
import agendasSvc from '@openagenda/agendas';
import cmn from '../lib/commons-app.mjs';
import membersSvc from '../services/members/index.mjs';
import model from '../services/model/index.mjs';
import * as adminSvc from '../services/admin/admin.mjs';
import config from '../config/index.mjs';

const log = logs('admin/back');

const PreMw = ({ sessions, users }) => [
  cmn.loadBaseData('oa-admin.css'),
  sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
  users.mw.requireSuperAdmin(),
];

function index(req, res) {
  log('rendering index');

  res.send(
    '<html><body><a href="/admin/agendas">Agendas</a> - <a href="/admin/users">Users</a></body></html>',
  );
}

function throwTestError() {
  throw new Error('this is a test error');
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
  } catch (e) { /* e */
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

      const respUser = await usersSvc.patch(
        uid,
        patchedData,
        { detailed: true, removed: null, internal: true },
      );

      res.json({
        success: true,
        user: respUser,
      });
    })
    .catch(next);
}

function userSignin(req, res) {
  const {
    sessions,
  } = req.app.services;

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
      .then(user => {
        req.loadedUser = user;

        next();
      })
      .catch(cmn.catchError(req, res));
  };
}

function _searchUsers(req, res) {
  const perPage = 40;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  let where = ' where is_removed = 0';
  const entries = [];
  let total = 0;

  if (req.query.search) {
    where += ' and email like ? or full_name like ?';
    entries.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }

  model.lib.query(
    `select count(id) as total
     from user${where}`,
    entries,
    (err, rows) => {
      if (err) return cmn.catchError(req, res)(err);

      total = rows[0].total;

      model.lib.query(
        `select *
         from user${where}
         order by created_at desc
         limit ${(page - 1) * perPage}, ${perPage}`,
        entries,
        (err1, rows1) => {
          if (err1) return cmn.catchError(req, res)(err1);

          cmn.renderJson(req, res, {
            users: rows1.map(({
              uid,
              full_name: fullName, email,
              is_removed: isRemoved,
            }) => ({
              uid,
              fullName,
              email,
              isRemoved,
            })),
            page,
            total,
            perPage,
          });
        },
      );
    },
  );
}

function eventsByWeek(req, res) {
  adminSvc.getIndexedEventsByWeek((err, result) => {
    if (err) return cmn.errorResponse(req, res, err);

    cmn.renderJson(req, res, {
      success: true,
      data: result,
    });
  });
}

function eventsDiff(req, res) {
  adminSvc.getIndexDiff((err, diff) => {
    if (err) return cmn.errorResponse(req, res, err);

    cmn.renderJson(req, res, {
      success: true,
      diff,
    });
  });
}

function _getFork(services, begin, end) {
  const { users: usersSvc } = services;

  return Promise.all([
    promisify(model.reviews().total)({ createdAt: { gte: begin, lte: end } }),
    promisify(model.events().total)({ createdAt: { gte: begin, lte: end } }),
    usersSvc
      .find({ query: { $limit: 0, createdAt: { $gte: begin, $lte: end } } })
      .then(({ total }) => total),
  ]);
}

function search(req, res) {
  const { services } = req.app;
  const start = moment(req.query.begin, 'DD-MM-YYYY').toDate();
  const end = moment(req.query.end, 'DD-MM-YYYY').endOf('day').toDate();

  _getFork(services, start, end)
    .then(([r, e, u]) => {
      cmn.render(req, res, 'admin/index', {
        events: {
          total: e,
          totalInWeek: null,
          totalInMonth: null,
        },

        reviews: {
          total: r,
          totalInWeek: null,
          totalInMonth: null,
        },

        users: {
          total: u,
          totalInWeek: null,
          totalInMonth: null,
        },
      });
    })
    .catch(({ message }) => {
      log(message);
    });
}

async function getUsers(req, res, next) {
  const { redis } = req.app.services;

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
          .then(members => {
            agendasSvc.list(
              {
                uid: members.map(({ agendaUid }) => agendaUid),
              },
              0,
              1000,
              { private: null },
              (err, agendas) => {
                model.lib.query(
                  'SELECT count(*) as nbrEvents, agenda_uid as agendaUid '
                  + 'FROM agenda_event WHERE user_uid = ? GROUP BY agenda_uid',
                  [req.loadedUser.uid],
                  (err1, counters) => {
                    // eslint-disable-next-line no-param-reassign
                    members = members.map(member => {
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
                  },
                );
              },
            );
          });
      });
    }
    return _searchUsers(req, res);
  }

  cmn.render(req, res, 'admin/users', {
    accountActivationMode: await redis.get('accountActivationMode') ?? 'manual',
  });
}

export default app => {
  const preMw = PreMw(app.services);

  app.get('/admin', preMw, index);
  app.get('/admin/search', preMw, search);
  app.get('/admin/users', preMw, getUsers);
  app.get('/admin/users/signin', preMw, _loadUser(), userSignin);
  app.get('/admin/users/activate', preMw, _loadUser(), userActivate);
  app.get('/admin/users/blacklist', preMw, _loadUser(), userBlacklist);
  app.post('/admin/users/update', preMw, _loadUser('post'), userUpdate);
  app.get('/admin/users/activationMode', preMw, toggleActivationMode);
  app.get('/admin/throw', preMw, throwTestError);
  app.get('/admin/users/changePassword', preMw, userChangePassword);
  app.get('/admin/eventsbyweek', preMw, eventsByWeek);
  app.get('/admin/eventsdiff', preMw, eventsDiff);
};
