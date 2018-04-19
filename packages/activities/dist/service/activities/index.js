"use strict";

var _ = require('lodash');
var add = require('./add');
var list = require('./list');
var get = require('./get');

var config = void 0;
var knex = void 0;
var service = void 0;

module.exports = Object.assign(activities, {
  init: init,
  // global usage, without predefined feed
  add: add.bind(null, null),
  list: list.bind(null, null),
  get: get.bind(null, null)
});

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;

  add.init({ config: config, knex: knex, service: service });
  list.init({ config: config, knex: knex, service: service });
  get.init({ config: config, knex: knex, service: service });
}

function activities(identifiers) {

  return _.mapValues({
    add: add,
    list: list,
    get: get
  }, function (fn) {
    return fn.bind(null, identifiers);
  });
}
//# sourceMappingURL=index.js.map