"use strict";

var _ = require('lodash');
var nodefn = require('when/node');
var async = require('async');
var log = require('@openagenda/logs')('activities/notifications/tasks/prepareSummary');
var usersSvc = require('@openagenda/users');
var unsubscribed = require('@openagenda/unsubscribed');
var sendSummary = require('./sendSummary');

var config = void 0;
var knex = void 0;
var service = void 0;

module.exports = Object.assign(prepareSummary, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

async function prepareSummary() {

  _traverseTable(config.schemas.feed_notification, function (q) {
    return q.select(config.schemas.feed_notification + '.*', config.schemas.feed + '.entity_type', config.schemas.feed + '.entity_uid').where({ state: 0, sent: 0 }).groupBy('feed_id').orderBy('updated_at', 'desc').join(config.schemas.feed, config.schemas.feed_notification + '.feed_id', config.schemas.feed + '.id');
  }, async function (item, index, cb) {

    var notifications = await knex(config.schemas.feed_notification).select().where({ feed_id: item.feed_id, state: 0, sent: 0 }).andWhere('id', '>=', item.id).orderBy('updated_at', 'desc');

    notifications = notifications.map(function (notif) {

      notif = _.mapKeys(notif, function (value, key) {
        return _.camelCase(key);
      });
      notif.store = JSON.parse(notif.store || '{}');

      return notif;
    });

    var user = await nodefn.call(usersSvc.get, { uid: item.entity_uid }, { detailed: true });

    unsubscribed(user.uid).is({ subject: 'notifications', type: 'notifications_summary' }, function (err, is) {

      if (err) return cb(err);

      if (!is) sendSummary({ user: user, notifications: notifications });

      cb();
    });
  }, function (err, rowsAffected) {

    if (err) return log('error', err);
  });
}

function _traverseTable(table, queryModifier, eachCb, cb) {

  var rowsCount = 0;
  var rowsAffected = 0;

  async.doWhilst(function (dcb) {

    var query = knex(table).offset(rowsAffected).limit(100);

    queryModifier(query).then(function (rows) {

      rowsCount = rows.length;
      rowsAffected += rows.length;

      if (!rows.length) return dcb();

      async.eachOfSeries(rows, function (item, i, ecb) {
        eachCb(item, rowsAffected - rows.length + Number.parseInt(i), ecb);
      }, dcb);
    });
  }, function () {
    return rowsCount > 0;
  }, function (err) {

    cb(err, rowsAffected);
  });
}
//# sourceMappingURL=prepareSummary.js.map