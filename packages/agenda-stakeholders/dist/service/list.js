"use strict";

var w = require('when');
var _ = require('lodash');

var parseListArguments = require('@openagenda/service-utils/parseListArguments');

var format = require('./format');
var credentialTypes = require('../iso/credentialTypes');
var evaluateCredentialFilter = require('./lib/evaluateCredentialFilter');
var validators = require('../iso/validators');

var log = require('@openagenda/logs')('list');

module.exports = _.extend(list, { init: init });

// service globals
var schemas = void 0,
    knex = void 0,
    interfaces = void 0;

function list() {

  // prefilter is defined by service host endpoint ( .agenda or .user )
  var preFilter = arguments[0]; // this guy applies always

  var _parseListArguments$a = parseListArguments.apply(null, Array.prototype.slice.call(arguments, 1)),
      query = _parseListArguments$a.query,
      offset = _parseListArguments$a.offset,
      limit = _parseListArguments$a.limit,
      options = _parseListArguments$a.options,
      cb = _parseListArguments$a.cb;

  _.extend(options, _legacyOptions(query, options));

  w({
    preFilter: preFilter,
    offset: offset,
    limit: limit,
    query: validators.clean('listQuery', _.extend({}, query, preFilter)),
    options: validators.clean('listOptions', options),
    knex: knex(schemas.stakeholder),
    result: {
      stakeholders: [],
      total: null
    }
  }).then(evaluateCredentialFilter.bind(null, interfaces)).then(_list).then(_getEventCounts).then(_getUsersInfo).then(_total).done(function (v) {

    cb(null, v.result.stakeholders, v.result.total);
  }, cb);
}

function init(config) {
  ;

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;
}

function _total(v) {

  if (!v.options.total) return v;

  return v.knex.count('id as stakeholders').then(function (result) {

    v.result.total = result[0].stakeholders;

    return v;
  });
}

function _list(v) {

  var detailClone = void 0;

  // not very clear
  v.knex.where(format.objToDb(_.omit(v.query, ['id', 'userId']), true));

  if (v.query.search !== null) {

    v.knex.andWhere('store', 'like', '%' + v.query.search + '%');
  }

  if (v.query.id !== null) {

    v.knex.andWhere('id', 'in', v.query.id);
  }

  if (v.query.userId !== null) {

    v.knex.andWhere('user_id', 'in', v.query.userId);
  }

  if (v.query.invited !== null) {

    v.knex[v.query.invited ? 'whereNull' : 'whereNotNull']('user_id');
  }

  if (v.query.credentials.length) {

    v.knex.whereIn('credential', v.query.credentials);
  }

  if (v.query.actionsCounterEqualZero !== null) {

    v.knex.andWhere('actions_counter', v.query.actionsCounterEqualZero ? '=' : '<>', 0);
  }

  if (v.query.deletedUser !== null) {

    v.knex.andWhere('deleted_user', !!v.query.deletedUser);
  }

  detailClone = v.knex.clone().select('id', 'credential', 'user_id', 'review_id', 'store', 'organization', 'updated_at', 'created_at', 'deleted_user', 'actions_counter').limit(v.limit).offset(v.offset);

  if (v.query.order && v.query.order === 'credential') {

    detailClone.orderBy(knex.raw('field( credential,' + credentialTypes.types.map(function (c) {
      return c.value;
    }).reverse().join(',') + ')'));
  } else {

    detailClone.orderBy('actions_counter', 'desc');
  }

  return detailClone.then(function (dbStakeholders) {

    v.result.stakeholders = dbStakeholders.map(function (s) {
      return format.dbToObj(s, { showSlugs: v.options.showSlugs });
    });

    return v;
  });
}

function _getEventCounts(v) {

  if (!v.options.detailed || !interfaces) {

    return v;
  }

  return w.all(v.result.stakeholders.map(function (s) {

    var d = w.defer();

    interfaces.getEventCount(v.query.agendaId, s.userId, function (err, count) {

      if (err) return d.reject(err);

      s.eventCount = count;

      d.resolve(s);
    });

    return d.promise;
  })).then(function (stakeholders) {

    v.result.stakeholders = stakeholders;

    return v;
  });
}

function _getUsersInfo(v) {

  if (!v.options.detailed || !interfaces) {

    return v;
  }

  return w.all(v.result.stakeholders.map(function (s) {

    var d = w.defer();

    interfaces.getUser({ id: s.userId }, function (err, user) {

      if (err) return d.reject(err);

      s.user = user;

      d.resolve(s);
    });

    return d.promise;
  })).then(function (stakeholders) {

    v.result.stakeholders = stakeholders;

    return v;
  });
}

/**
 * previous iteration of service had options mingled with query
 * this function extract those options
 */
function _legacyOptions(query, options) {

  var l = {};

  ['total', 'detailed'].forEach(function (k) {

    if (query[k] !== undefined && options[k] === undefined) {

      l[k] = !!query[k];
    }
  });

  return l;
}
//# sourceMappingURL=list.js.map