'use strict';

const _ = require('lodash');
const { promisify } = require('util');
const moment = require('moment');
const async = require('async');
const sessions = require('@openagenda/sessions');
const log = require('@openagenda/logs')('admin/back');
const agendasSvc = require('@openagenda/agendas');
const cmn = require('../lib/commons-app');
const membersSvc = require('../services/members');
const model = require('../services/model');
const adminSvc = require('../services/admin/admin');
const config = require('../config');

const preMw = [
  cmn.loadBaseData('oa-admin.css'),
  sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
  cmn.requireSuperAdmin,
];

module.exports = (app) => {
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

function index(req, res) {
  const { services } = req.app;
  const totals = {};
  const totalsWeek = {};
  const totalsMonth = {};

  log('rendering index');

  res.send(
    `<html><body><a href="/admin/agendas">Agendas</a> - <a href="/admin/users">Users</a></body></html>`
  );
}

function throwTestError(req, res, next) {
  throw new Error('this is a test error');
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

    .catch(function (err) {
      log(err.message);
    });
}

async function getUsers(req, res, next) {
  const { redisConfigStore } = req.app.services;

  if (req.xhr) {
    if (req.query.uid) {
      return _loadUser()(req, res, () => {
        if (!req.loadedUser.id) return next(new Error('User not found'));

        membersSvc
          .list(
            { userUid: req.loadedUser.uid },
            { limit: 1000, order: 'id.desc' },
            { userOptions: { detailed: true } }
          )
          .then((members) => {
            agendasSvc.list(
              {
                uid: members.map((m) => m.agendaUid),
              },
              0,
              1000,
              { private: null },
              (err, agendas) => {
                model.lib.query(
                  'SELECT count(*) as nbrEvents, agenda_uid as agendaUid ' +
                  'FROM agenda_event WHERE user_uid = ? GROUP BY agenda_uid',
                  [req.loadedUser.uid],
                  (err, counters) => {
                    members = members.map((member) => {
                      member.agenda = agendas.filter(
                        (agenda) => agenda.uid == member.agendaUid
                      )[0];

                      const counter = counters.filter(
                        (counter) => counter.agendaUid == member.agendaUid
                      )[0];
                      member.nbrEvents = counter && counter.nbrEvents;

                      return member;
                    });

                    cmn.renderJson(req, res, {
                      user: req.loadedUser,
                      members,
                    });
                  }
                );
              }
            );
          });
      });
    } else {
      return _searchUsers(req, res);
    }
  }

  cmn.render(req, res, 'admin/users', {
    accountActivationMode: await redisConfigStore('accountActivationMode', {
      defaultValue: 'manual',
      throwOnError: false
    }),
  });
}

function userChangePassword(req, res) {
  const { users: usersSvc } = req.app.services;
  const { uid, password } = req.query;

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
        { internal: true }
      );

      await mails.send( {
        template: 'activatedAccount',
        to: req.loadedUser.email,
        lang: req.loadedUser.culture,
        data: {
          activateLink: config.root,
        },
        queue: false,
      } );

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

async function toggleActivationMode(req, res, next) {
  const { redisConfigStore, sessions } = req.app.services;

  try {
    await redisConfigStore.set('accountActivationMode', req.query.mode);
  } catch (e) {}
  return res.redirect(`/admin/users`);
}

async function userBlacklist(req, res, next) {
  const { users: usersSvc, sessions } = req.app.services;

  const userUid = req.loadedUser.uid;

  try {
    const isBlacklisted = _.get(req.query, 'isBlacklisted', 'true') === 'true';

    req.loadedUser = await usersSvc.patch(
      userUid,
      { isBlacklisted },
      { internal: true }
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

function userUpdate(req, res, next) {
  const { users: usersSvc } = req.app.services;

  usersSvc
    .get(req.loadedUser.uid, { detailed: true, removed: null })
    .then(async (user) => {
      const store = user.store || {};

      if (!store.enable_secret && req.body.enable_secret) {
        await usersSvc.generateApiKey(
          user.uid,
          {
            secretKey: true,
          },
          { removed: null }
        );

        user = await usersSvc.patch(
          user.uid,
          {
            store: {
              ...store,
              enable_secret: true,
            },
          },
          { detailed: true, removed: null, internal: true }
        );
      }

      res.json({
        success: true,
        user,
      });
    })
    .catch(next);
}

function userSignin(req, res) {
  sessions.open(req, res, req.loadedUser, () => {
    if (req.xhr) return cmn.renderJson(req, res, { success: true });

    return res.redirect(302, '/home');
  });
}

function _loadUser(type = 'get') {
  return (req, res, next) => {
    const { users: usersSvc } = req.app.services;

    const request = req[type === 'get' ? 'query' : 'body'];

    if (!request.uid)
      return cmn.renderJson(req, res, {
        success: false,
        message: 'user uid is missing',
      });

    const uid = request.uid;

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
  var perPage = 40,
    page = req.query.page ? parseInt(req.query.page, 10) : 1,
    where = ' where is_removed = 0',
    entries = [],
    total = 0;

  if (req.query.search) {
    where += ' and email like ? or full_name like ?';
    entries.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }

  model.lib.query(
    'select count(id) as total from user' + where,
    entries,
    function (err, rows) {
      if (err) return cmn.catchError(req, res)(err);

      total = rows[0].total;

      model.lib.query(
        'select * from user' +
        where +
        ' order by created_at desc limit ' +
        (page - 1) * perPage +
        ', ' +
        perPage,
        entries,
        function (err, rows) {
          if (err) return cmn.catchError(req, res)(err);

          cmn.renderJson(req, res, {
            users: rows.map(function (row) {
              return {
                uid: row.uid,
                fullName: row.full_name,
                email: row.email,
                isRemoved: row.is_removed,
              };
            }),
            page: page,
            total: total,
            perPage: perPage,
          });
        }
      );
    }
  );
}

function eventsByWeek(req, res) {
  adminSvc.getIndexedEventsByWeek(function (err, result) {
    if (err) return cmn.errorResponse(req, res, err);

    cmn.renderJson(req, res, {
      success: true,
      data: result,
    });
  });
}

function eventsDiff(req, res) {
  adminSvc.getIndexDiff(function (err, diff) {
    if (err) return cmn.errorResponse(req, res, err);

    cmn.renderJson(req, res, {
      success: true,
      diff: diff,
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
      .then((res) => res.total),
  ]);
}

function _getTotals(services, cb) {
  const usersSvc = services.users;

  async.parallel(
    [
      async.apply(model.reviews().total),

      async.apply(model.events().total),

      (cb) =>
        usersSvc
          .find({ query: { $limit: 0 } })
          .then((res) => cb(null, res.total)),
    ],
    cb
  );
}

function _getTotalsWeek(services, cb) {
  const usersSvc = services.users;

  const weekStart = moment().subtract(1, 'week').startOf('week').toDate();
  const weekStop = moment().subtract(1, 'week').endOf('week').toDate();

  async.parallel(
    [
      async.apply(model.reviews().total, {
        createdAt: { gt: weekStart, lt: weekStop },
      }),

      async.apply(model.events().total, {
        createdAt: { gt: weekStart, lt: weekStop },
      }),

      (cb) =>
        usersSvc
          .find({
            query: { $limit: 0, createdAt: { $gt: weekStart, $lt: weekStop } },
          })
          .then((res) => cb(null, res.total)),
    ],
    cb
  );
}

function _getTotalsMonth(services, cb) {
  const usersSvc = services.users;

  const monthStart = moment().subtract(1, 'month').startOf('month').toDate();
  const monthStop = moment().subtract(1, 'month').endOf('month').toDate();

  async.parallel(
    [
      async.apply(model.reviews().total, {
        createdAt: { gt: monthStart, lt: monthStop },
      }),

      async.apply(model.events().total, {
        createdAt: { gt: monthStart, lt: monthStop },
      }),

      (cb) =>
        usersSvc
          .find({
            query: {
              $limit: 0,
              createdAt: { $gt: monthStart, $lt: monthStop },
            },
          })
          .then((res) => cb(null, res.total)),
    ],
    cb
  );
}

function _layoutData(totals, totalsWeek, totalsMonth) {
  return {
    events: {
      total: totals.events,
      totalInWeek: totalsWeek.events,
      totalInMonth: totalsMonth.events,
    },
    reviews: {
      total: totals.reviews,
      totalInWeek: totalsWeek.reviews,
      totalInMonth: totalsMonth.reviews,
    },
    users: {
      total: totals.users,
      totalInWeek: totalsWeek.users,
      totalInMonth: totalsMonth.users,
    },
  };
}
