"use strict";

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = require('@openagenda/basic-logger');

var _ = require('lodash');
var async = require('async');

var ReactDOMServer = require('react-dom/server');

var matchAppMw = require('@openagenda/react-utils/dist/matchAppMw');
var createStore = require('@openagenda/react-utils/dist/createStore');
var ApiClient = require('@openagenda/react-utils/dist/ApiClient');

var getAdminRoutes = require('./react/apps/admin/routes');
var getAgendaRoutes = require('./react/apps/agenda/routes');
var getUserRoutes = require('./react/apps/user/routes');
var reducer = require('./react/redux/reducer');

var notificationsApp = require('./react/apps/notifications');

var activitiesSvc = void 0;

var config = void 0;
var log = void 0;

module.exports = {
  matchAdminApp: matchAppMw(createStore(reducer), getAdminRoutes, ApiClient),
  matchAgendaApp: matchAppMw(createStore(reducer), getAgendaRoutes, ApiClient),
  matchUserApp: matchAppMw(createStore(reducer), getUserRoutes, ApiClient),
  init: init,
  list: list,
  notifications: {
    count: notificationsCount,
    list: notificationsList,
    markRead: notificationsMarkRead,
    markAllRead: notificationsMarkAllRead,
    remove: notificationsRemove
  }
};

function init(c) {

  config = c;

  activitiesSvc = c.services.activities;

  if (c.logger) {

    logger.setLogger(c.logger);
  }

  log = logger('activity-apps/middleware');
}

function list(options) {

  return function (req, res) {

    var query = _.pick(req.query, ['actor', 'verb', 'object', 'target']);
    var limit = config.limit;

    var _req$query = req.query,
        datetimeRange = _req$query.datetimeRange,
        fromId = _req$query.fromId;


    if (datetimeRange) {
      var _datetimeRange$split = datetimeRange.split('|'),
          _datetimeRange$split2 = (0, _slicedToArray3.default)(_datetimeRange$split, 2),
          afterAt = _datetimeRange$split2[0],
          beforeAt = _datetimeRange$split2[1];

      query.createdAt = {
        $lte: new Date(beforeAt),
        $gte: new Date(afterAt)
      };
    }

    var svc = options ? activitiesSvc.feed(options) : activitiesSvc;

    svc.activities.list(query, fromId || 0, limit).then(function (activities) {
      res.send({ activities: activities });
    }).catch(function (err) {
      res.status(400).send(err);
    });
  };
}

function notificationsCount(req, res) {

  activitiesSvc.feed({
    entityType: 'user',
    entityUid: req.user.uid
  }).notifications.count({ state: 0 }).then(function (counter) {

    res.json({ counter: counter });
  }).catch(function (err) {

    res.status(400).json({ error: err });
  });
}

function notificationsList(req, res) {

  var limit = req.query.justOne ? 1 : 5;

  activitiesSvc.feed({
    entityType: 'user',
    entityUid: req.user.uid
  }).notifications.list(req.query.fromId, limit).then(async function (notifications) {

    var app = notificationsApp({ notifications: notifications, lang: req.lang || 'fr', userUid: req.user.uid });

    await activitiesSvc.feed({
      entityType: 'user',
      entityUid: req.user.uid
    }).notifications.markAs({}, 1, { allowRegress: false, listArgs: [0, 10000] });

    // return activitiesSvc.feed( {
    //   entityType: 'user',
    //   entityUid: req.user.uid
    // } ).notifications.markAs( { ids: notifications.map( v => v.id ) }, 1, { allowRegress: false } )
    //   .then( notifications => {

    return activitiesSvc.feed({
      entityType: 'user',
      entityUid: req.user.uid
    }).notifications.count({ state: 0 }).then(function (counter) {

      res.json({
        counter: counter,
        notifications: notifications,
        html: ReactDOMServer.renderToStaticMarkup(app),
        lastPage: notifications.length < limit
      });
    });

    // } );
  }).catch(function (err) {

    log('error', err);

    res.status(400).json({ error: err });
  });
}

function notificationsMarkRead(req, res) {

  activitiesSvc.feed({
    entityType: 'user',
    entityUid: req.user.uid
  }).notifications.markAs({ ids: [req.params.notifId] }, 2).then(function (notifications) {

    res.json({ notification: notifications.length ? notifications[0] : null });
  }).catch(function (err) {

    res.status(400).json({ error: err });
  });
}

function notificationsMarkAllRead(req, res) {

  var rowsCount = 0;
  var rowsAffected = 0;
  var fromId = void 0;

  async.doWhilst(function (dcb) {

    activitiesSvc.feed({
      entityType: 'user',
      entityUid: req.user.uid
    }).notifications.list({ stateNot: 2 }, fromId, 100).then(function (notifs) {

      rowsCount = notifs.length;
      rowsAffected += notifs.length;

      if (!notifs.length) return dcb();

      fromId = _.last(notifs).id;

      activitiesSvc.feed({
        entityType: 'user',
        entityUid: req.user.uid
      }).notifications.markAs({ ids: notifs.map(function (v) {
          return v.id;
        }) }, 2).then(function () {
        return dcb();
      }, dcb);
    });
  }, function () {
    return rowsCount > 0;
  }, function (err) {

    if (err) return res.status(400).json({ error: err });

    res.json({ rowsAffected: rowsAffected });
  });
}

function notificationsRemove(req, res) {

  activitiesSvc.feed({
    entityType: 'user',
    entityUid: req.user.uid
  }).notifications.remove({ ids: [req.params.notifId] }).then(function (notifications) {

    res.json({ notification: notifications.length ? notifications[0] : null });
  }).catch(function (err) {

    res.status(400).json({ error: err });
  });
}
//# sourceMappingURL=middleware.js.map