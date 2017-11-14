'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _bluebird = require('bluebird');

var init = function () {
  var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(c) {
    var knexConfig;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            if (c.logger) _logs2.default.setModuleConfig(c.logger);

            _lodash2.default.merge(config, _lodash2.default.pick(c, ['mysql', 'schemas', 'cache', 'interfaces', 'types']));

            knexConfig = getKnexConfig(c);

            config.knex = (0, _knex2.default)(knexConfig);

            if (!c.migrations) {
              _context.next = 7;
              break;
            }

            _context.next = 7;
            return (0, _bluebird.resolve)(config.knex.migrate.latest());

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function init(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

var _logs = require('@openagenda/logs');

var _logs2 = _interopRequireDefault(_logs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {
  knex: null
};

module.exports = _lodash2.default.extend(config, { init: init });

function getKnexConfig(c) {
  var knexConfig = void 0;

  if (c.knex) {
    knexConfig = (0, _extends3.default)({}, c.knex.client.config, {
      pool: c.knex.client.pool,
      schemas: (0, _extends3.default)({}, c.knex.client.config.schemas, c.schemas)
    });
  } else {
    knexConfig = {
      client: 'mysql',
      connection: c.mysql,
      schemas: c.schemas
    };
  }

  if (c.migrations) {
    knexConfig.migrations = (0, _extends3.default)({}, c.knex ? c.knex.client.config.migrations : {}, c.migrations, {
      directory: _path2.default.resolve(_path2.default.dirname(__dirname), 'migrations')
    });
  }

  return knexConfig;
}
//# sourceMappingURL=config.js.map