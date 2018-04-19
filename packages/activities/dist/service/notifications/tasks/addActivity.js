"use strict";

var _ = require('lodash');
var VError = require('verror');
var log = require('@openagenda/logs')('activities/dist/notifications/tasks/addActivity');
var queue = require('@openagenda/queue');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var groupBy = require('../lib/groupBy');

var config = void 0;
var knex = void 0;
var service = void 0;
var q = void 0;

module.exports = Object.assign(task, { init: init, addActivity: addActivity });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;

  q = queue(config.queue.names.addActivity, { redis: config.queue.redis });
}

function task() {
  var onAdd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


  q.setConsumer(function (_ref2, cb) {
    var identifiers = _ref2.identifiers,
        activity = _ref2.activity;


    addActivity(identifiers, activity, function (err, result) {

      if (err && err.message !== 'The notifications concern only user feeds') {
        log('error', 'Error in addActivity task: %s', err);
      }

      if (onAdd) onAdd(err, result);

      cb(err, result);
    });
  });

  q.launch();

  return {
    shutdown: q.shutdown
  };
}

function parseArguments(identifiers, activity, options, cb) {

  var result = {
    identifiers: identifiers,
    activity: activity,
    options: options,
    cb: cb
  };

  var args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 3) {

    Object.assign(result, {
      identifiers: args[0],
      activity: args[1],
      options: null,
      cb: args[2]
    });
  }

  return result;
}

function addActivity() {
  var _parseArguments$apply = parseArguments.apply(null, arguments),
      identifiers = _parseArguments$apply.identifiers,
      activity = _parseArguments$apply.activity,
      options = _parseArguments$apply.options,
      cb = _parseArguments$apply.cb;

  var params = _.merge({
    excludeIds: []
  }, options);

  if (identifiers.entityType && identifiers.entityType !== 'user') {

    return promisePlusCb(Promise.reject(new VError('The notifications concern only feeds users')), cb);
  }

  var promise = service.feed(identifiers).get({ internal: true }).then(function (feed) {

    if (feed === null) {
      return Promise.reject(new VError('Feed not found'));
    }

    if (feed.entityType !== 'user') {
      return Promise.reject(new VError('The notifications concern only user feeds'));
    }

    if (feed.entityType + ':' + feed.entityUid === activity.actor) {
      return null;
    }

    var groupedBy = (groupBy[activity.verb] || []).map(function (v) {
      return v + ':' + _.get(activity, v);
    }).join('|');

    return service.feed(feed).notifications.get({
      feedId: feed.id,
      verb: activity.verb,
      groupBy: groupedBy,
      state: 0
    }, { excludeIds: params.excludeIds }).then(function (notif) {

      if (notif && notif.verb === 'agenda.setOfficial') {
        notif = undefined;
      }

      if (notif && ['agenda.addMember', 'agenda.setMemberRole'].includes(notif.verb) && feed.entityType + ':' + feed.entityUid === activity.object) {
        notif = undefined;
      }

      if (notif === undefined) {

        var store = {
          actors: activity.actor ? [activity.actor] : [],
          objects: activity.object ? [activity.object] : [],
          targets: activity.target ? [activity.target] : [],
          labels: {
            actor: activity.store && activity.store.labels && activity.store.labels.actor,
            object: activity.store && activity.store.labels && activity.store.labels.object,
            target: activity.store && activity.store.labels && activity.store.labels.target
          }
        };

        var additionalProps = _.without(groupBy[activity.verb], 'actor', 'object', 'target').reduce(function (result, path) {
          _.set(result, path, _.get(activity, path));
          return result;
        }, {});

        return knex(config.schemas.feed_notification).insert({
          feed_id: feed.id,
          verb: activity.verb,
          group_by: groupedBy,
          store: JSON.stringify(_.merge(store, additionalProps.store)),
          updated_at: new Date()
        }).then(function (ids) {
          return service.feed(feed).notifications.get(ids[0]);
        });
      } else {

        var createNewStoreKey = function createNewStoreKey(key) {
          var values = Array.from(notif.store[key + 's']);
          if (values.includes(activity[key])) {
            return values;
          }
          if (values.length >= 100) {
            return { 0: values[0], length: 101 };
          }
          return values.concat(activity[key]);
        };

        var _store = Object.assign({}, notif.store, {
          actors: createNewStoreKey('actor'),
          objects: createNewStoreKey('object'),
          targets: createNewStoreKey('target'),
          labels: {
            actor: activity.store && activity.store.labels && activity.store.labels.actor,
            object: activity.store && activity.store.labels && activity.store.labels.object,
            target: activity.store && activity.store.labels && activity.store.labels.target
          }
        });

        if (['agenda.addMember', 'agenda.setMemberRole'].includes(notif.verb) && _store.objects.includes(feed.entityType + ':' + feed.entityUid)) {

          return addActivity(identifiers, activity, { excludeIds: (params.excludeIds || []).concat(notif.id) }, cb);
        }

        return knex(config.schemas.feed_notification).where({ id: notif.id }).update({
          store: JSON.stringify(_store),
          updated_at: new Date()
        }).then(function () {
          return service.feed(feed).notifications.get(notif.id);
        });
      }
    });
  });

  return promisePlusCb(promise, cb);
}
//# sourceMappingURL=addActivity.js.map