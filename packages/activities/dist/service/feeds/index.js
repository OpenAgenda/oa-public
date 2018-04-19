"use strict";

var _ = require('lodash');
var create = require('./create');
var get = require('./get');
var follow = require('./follow');
var unfollow = require('./unfollow');
var remove = require('./remove');

var config = void 0;
var knex = void 0;
var service = void 0;

module.exports = Object.assign(feeds, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;

  create.init({ config: config, knex: knex, service: service });
  get.init({ config: config, knex: knex, service: service });
  follow.init({ config: config, knex: knex, service: service });
  unfollow.init({ config: config, knex: knex, service: service });
  remove.init({ config: config, knex: knex, service: service });
}

function feeds(identifiers) {

  return _.mapValues({
    create: create,
    get: get,
    follow: follow,
    unfollow: unfollow,
    remove: remove
  }, function (fn) {
    return fn.bind(null, identifiers);
  });
}
//# sourceMappingURL=index.js.map