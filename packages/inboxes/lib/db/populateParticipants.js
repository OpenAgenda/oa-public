'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _bluebird = require('bluebird');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require('../config');

var _mapper = require('../utils/mapper');

var _mapper2 = _interopRequireDefault(_mapper);

var _populateDetails = require('./populateDetails');

var _populateDetails2 = _interopRequireDefault(_populateDetails);

var _inboxFieldsMap = require('./inboxFieldsMap');

var _inboxFieldsMap2 = _interopRequireDefault(_inboxFieldsMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(entities) {
    var ids, result;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(entities === null)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', null);

          case 2:
            if (Array.isArray(entities)) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return (0, _bluebird.resolve)(populateParticipants([entities]));

          case 5:
            return _context.abrupt('return', _context.sent[0]);

          case 6:
            ids = entities.map(function (v) {
              return v.id;
            });

            // request all inboxes of all conversations

            _context.next = 9;
            return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inboxConversation).select().column(_config.schemas.inboxConversation + '.conversation_id as conversationId').column(_mapper2.default.listFields(_inboxFieldsMap2.default, 'select', 'db', {}, true, 'inbox.').map(function (v) {
              return _config.schemas.inbox + '.' + v;
            })).leftJoin(_config.schemas.inbox, _config.schemas.inbox + '.id', _config.schemas.inboxConversation + '.inbox_id').whereIn('conversation_id', ids).map(function (row) {
              return _lodash2.default.reduce(row, function (r, value, key) {
                return _lodash2.default.set(r, key, value);
              }, {});
            }));

          case 9:
            result = _context.sent;
            _context.t0 = _lodash2.default;
            _context.next = 13;
            return (0, _bluebird.resolve)((0, _populateDetails2.default)(result));

          case 13:
            _context.t1 = _context.sent;
            result = _context.t0.groupBy.call(_context.t0, _context.t1, 'conversationId');
            return _context.abrupt('return', entities.map(function (v) {
              return result[v.id] ? (0, _extends3.default)({}, v, {
                inboxes: result[v.id].map(function (w) {
                  return w.inbox;
                })
              }) : v;
            }));

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function populateParticipants(_x) {
    return _ref.apply(this, arguments);
  }

  return populateParticipants;
}();

module.exports = exports['default'];
//# sourceMappingURL=populateParticipants.js.map