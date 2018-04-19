"use strict";

var _ = require('lodash');
var service = require('./service');
var Stakeholder = require('./iso/Stakeholder');

module.exports = {
  agenda: agenda
};

function agenda() {
  var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'agenda';


  return {
    load: load,
    get: get,
    list: list,
    stats: stats,
    update: update,
    remove: remove,
    bulk: bulk,
    message: message
  };

  function load() {
    var serviceNamespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'stakeholders';


    return function (req, res, next) {

      _.set(req, serviceNamespace, service(_.get(req, namespace).id));

      next();
    };
  }

  function remove(options) {
    var _$merge = _.merge({
      namespaces: {
        identifiers: 'identifiers',
        user: 'user',
        result: 'result'
      }
    }, options || {}),
        namespaces = _$merge.namespaces;

    return function (req, res, next) {

      var identifiers = _.get(req, namespaces.identifiers);

      if (!identifiers) {

        console.log('DEPRECATED: Use identifiers namespace instead of user in .remove middleware (agenda-stakeholders)');
        identifiers = { userId: _.get(req, namespaces.user).id };
      }

      service.agenda(_.get(req, namespace).id).remove(identifiers, function (err, result) {

        if (err) return next(err);

        _.set(req, namespaces.result, result);

        next();
      });
    };
  }

  function update(options) {
    var _$merge2 = _.merge({
      credential: false, // allow credential update
      allowPartial: false, // allow partial update
      namespaces: {
        identifiers: 'identifiers',
        user: 'user',
        result: 'result',
        data: 'data', // the custom data only
        context: 'context'
      }
    }, options || {}),
        namespaces = _$merge2.namespaces,
        credential = _$merge2.credential,
        allowPartial = _$merge2.allowPartial;

    return function (req, res, next) {

      var identifiers = _.get(req, namespaces.identifiers);

      if (!identifiers) {

        console.log('DEPRECATED: Use identifiers namespace instead of user in .update middleware (agenda-stakeholders)');
        identifiers = { userId: _.get(req, namespaces.user).id };
      }

      service.agenda(_.get(req, namespace).id).update(identifiers, _.get(req, namespaces.data).fieldValues, {
        credential: credential ? _.get(req, namespaces.data).credential : null,
        allowPartial: allowPartial,
        context: _.get(req, namespaces.context, null)
      }, function (err, result) {

        if (err) return next(err);

        var mwResult = {
          success: result.success,
          valid: result.valid,
          errors: result.errors,
          fieldValues: result.stakeholder ? result.stakeholder.custom : null
        };

        if (credential) {

          mwResult.credential = result.stakeholder ? result.stakeholder.credential : null;
        }

        _.set(req, namespaces.result, mwResult);

        next();
      });
    };
  }

  function get(options) {
    var _$merge3 = _.merge({
      namespaces: {
        identifiers: 'identifiers',
        user: 'user',
        stakeholder: 'stakeholder',
        instance: 'stakeholderInstance'
      },
      options: {}
    }, options || {}),
        namespaces = _$merge3.namespaces,
        getOptions = _$merge3.options;

    return function (req, res, next) {

      var identifiers = _.get(req, namespaces.identifiers);

      if (!identifiers) {

        console.log('DEPRECATED: Use identifiers namespace instead of user in .get middleware (agenda-stakeholders)');
        identifiers = { userId: _.get(req, namespaces.user).id };
      }

      service.agenda(_.get(req, namespace).id).get(identifiers, getOptions, function (err, st) {

        if (err) return next(err);

        _.set(req, namespaces.stakeholder, st);

        if (!st) return next();

        _.set(req, namespaces.instance, new Stakeholder(_.mapKeys(st.custom, function (v, k) {
          return _.snakeCase(k);
        })));

        next();
      });
    };
  }

  function bulk(options) {
    var _$merge4 = _.merge({
      namespaces: {
        data: 'data',
        result: 'result',
        context: 'context'
      },
      allowPartial: false
    }, options || {}),
        namespaces = _$merge4.namespaces,
        allowPartial = _$merge4.allowPartial;

    return function (req, res, next) {
      var _$get = _.get(req, namespaces.data),
          stakeholders = _$get.stakeholders,
          credential = _$get.credential;

      service.agenda(_.get(req, namespace).id).bulk(stakeholders, {
        allowPartial: allowPartial,
        credential: credential,
        context: _.get(req, namespaces.context, null)
      }, function (err, result) {

        if (err) return next(err);

        _.set(req, namespaces.result, result);

        next();
      });
    };
  }

  function message(options) {
    var _$merge5 = _.merge({
      namespaces: {
        message: 'message',
        result: 'result',
        context: 'context',
        query: 'query'
      },
      actionsCounterEqualZero: null,
      deletedUser: false,
      id: undefined,
      userId: undefined
    }, options || {}),
        namespaces = _$merge5.namespaces,
        actionsCounterEqualZero = _$merge5.actionsCounterEqualZero,
        deletedUser = _$merge5.deletedUser,
        id = _$merge5.id,
        userId = _$merge5.userId;

    return function (req, res, next) {

      var query = _.pick(_.get(req, namespaces.query, {}), ['search', 'credential']);

      service.agenda(_.get(req, namespace).id).message(Object.assign({}, query, { actionsCounterEqualZero: actionsCounterEqualZero, deletedUser: deletedUser, id: id, userId: userId }), _.get(req, namespaces.message, ''), _.get(req, namespaces.context, null), function (err, result) {

        if (err) return next(err);

        _.set(req, namespaces.result, result);

        next();
      });
    };
  }

  function stats(options) {
    var _$merge6 = _.merge({
      namespaces: {
        stats: 'stats'
      }
    }, options || {}),
        namespaces = _$merge6.namespaces;

    return function (req, res, next) {

      service.agenda(_.get(req, namespace).id).stats(function (err, stats) {

        if (err) return next(err);

        _.set(req, namespaces.stats, stats);

        next();
      });
    };
  }

  function list(options) {
    var _$merge7 = _.merge({
      namespaces: {
        query: 'query',
        stakeholders: 'stakeholders',
        total: 'total'
      },
      detailed: false,
      limit: 20,
      showSlugs: false,
      total: false
    }, options || {}),
        namespaces = _$merge7.namespaces,
        limit = _$merge7.limit,
        showSlugs = _$merge7.showSlugs,
        detailed = _$merge7.detailed,
        total = _$merge7.total;

    return function (req, res, next) {

      var offset = ((_.get(req, namespaces.query).page || 1) - 1) * limit;

      service.agenda(_.get(req, namespace).id).list(_.get(req, namespaces.query), offset, limit, {
        total: total,
        detailed: detailed,
        showSlugs: showSlugs
      }, function (err, items, total) {

        if (err) next(err);

        _.set(req, namespaces.stakeholders, items);
        _.set(req, namespaces.total, total);

        next();
      });
    };
  }
}
//# sourceMappingURL=middleware.js.map