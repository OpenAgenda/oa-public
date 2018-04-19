'use strict';

var _ = require('lodash');
var addActivity = require('./addActivity');
var count = require('./count');
var get = require('./get');
var list = require('./list');
var markAs = require('./markAs');
var remove = require('./remove');

var addActivityTask = require('./tasks/addActivity');
var prepareSummaryTask = require('./tasks/prepareSummary');
var sendSummaryTask = require('./tasks/sendSummary');

var config = void 0;
var knex = void 0;
var service = void 0;

module.exports = Object.assign(notifications, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;

  addActivity.init({ config: config, knex: knex, service: service });
  count.init({ config: config, knex: knex, service: service });
  get.init({ config: config, knex: knex, service: service });
  list.init({ config: config, knex: knex, service: service });
  markAs.init({ config: config, knex: knex, service: service });
  remove.init({ config: config, knex: knex, service: service });

  addActivityTask.init({ config: config, knex: knex, service: service });
  prepareSummaryTask.init({ config: config, knex: knex, service: service });
  sendSummaryTask.init({ config: config, knex: knex, service: service });
}

function notifications(identifiers) {

  return _.mapValues({
    addActivity: addActivity,
    count: count,
    get: get,
    list: list,
    markAs: markAs,
    remove: remove
  }, function (fn) {
    return fn.bind(null, identifiers);
  });
}
//# sourceMappingURL=index.js.map