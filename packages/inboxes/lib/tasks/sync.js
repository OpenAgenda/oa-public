'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineJob = exports.processJob = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _bluebird = require('bluebird');

var processJob = exports.processJob = function () {
  var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(stats, data) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!data.user) {
              _context2.next = 3;
              break;
            }

            _context2.next = 3;
            return (0, _bluebird.resolve)(syncUser(stats, data.user));

          case 3:
            if (!data.agenda) {
              _context2.next = 6;
              break;
            }

            _context2.next = 6;
            return (0, _bluebird.resolve)(syncAgenda(stats, data.agenda));

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function processJob(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

var defineJob = exports.defineJob = function () {
  var _ref3 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(stats, q) {
    var agendasSvc, usersSvc, agendasList, limit, pos, users, _ref4, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, user, agendas, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, agenda;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            agendasSvc = _config.services.agendas, usersSvc = _config.services.users;
            agendasList = (0, _util.promisify)(agendasSvc.list);
            limit = 200;
            pos = 0;
            users = void 0;

          case 5:
            _context3.next = 7;
            return (0, _bluebird.resolve)(usersSvc.list(pos, limit));

          case 7:
            _ref4 = _context3.sent;
            users = _ref4.users;

            if (!_ref4) {
              _context3.next = 43;
              break;
            }

            if (users.length) {
              _context3.next = 12;
              break;
            }

            return _context3.abrupt('break', 43);

          case 12:
            pos = pos + users.length;

            log('users %d-%d queued to sync', pos - users.length, pos);

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context3.prev = 17;
            _iterator = (0, _getIterator3.default)(users);

          case 19:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context3.next = 27;
              break;
            }

            user = _step.value;

            stats.usersToSync += 1;
            _context3.next = 24;
            return (0, _bluebird.resolve)(q({ user: user }));

          case 24:
            _iteratorNormalCompletion = true;
            _context3.next = 19;
            break;

          case 27:
            _context3.next = 33;
            break;

          case 29:
            _context3.prev = 29;
            _context3.t0 = _context3['catch'](17);
            _didIteratorError = true;
            _iteratorError = _context3.t0;

          case 33:
            _context3.prev = 33;
            _context3.prev = 34;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 36:
            _context3.prev = 36;

            if (!_didIteratorError) {
              _context3.next = 39;
              break;
            }

            throw _iteratorError;

          case 39:
            return _context3.finish(36);

          case 40:
            return _context3.finish(33);

          case 41:
            _context3.next = 5;
            break;

          case 43:

            log('Total of %d users queued to sync', stats.usersToSync);

            pos = 0;
            agendas = void 0;

          case 46:
            _context3.next = 48;
            return (0, _bluebird.resolve)(agendasList(pos, limit, { private: null, internal: true }));

          case 48:
            if (!(agendas = _context3.sent)) {
              _context3.next = 82;
              break;
            }

            if (agendas.length) {
              _context3.next = 51;
              break;
            }

            return _context3.abrupt('break', 82);

          case 51:
            pos = pos + agendas.length;

            log('agendas %d-%d queued to sync', pos - agendas.length, pos);

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context3.prev = 56;
            _iterator2 = (0, _getIterator3.default)(agendas);

          case 58:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context3.next = 66;
              break;
            }

            agenda = _step2.value;

            stats.agendasToSync += 1;
            _context3.next = 63;
            return (0, _bluebird.resolve)(q({ agenda: agenda }));

          case 63:
            _iteratorNormalCompletion2 = true;
            _context3.next = 58;
            break;

          case 66:
            _context3.next = 72;
            break;

          case 68:
            _context3.prev = 68;
            _context3.t1 = _context3['catch'](56);
            _didIteratorError2 = true;
            _iteratorError2 = _context3.t1;

          case 72:
            _context3.prev = 72;
            _context3.prev = 73;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 75:
            _context3.prev = 75;

            if (!_didIteratorError2) {
              _context3.next = 78;
              break;
            }

            throw _iteratorError2;

          case 78:
            return _context3.finish(75);

          case 79:
            return _context3.finish(72);

          case 80:
            _context3.next = 46;
            break;

          case 82:

            log('Total of %d agendas queued to sync', stats.agendasToSync);

          case 83:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[17, 29, 33, 41], [34,, 36, 40], [56, 68, 72, 80], [73,, 75, 79]]);
  }));

  return function defineJob(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

var syncUser = function () {
  var _ref5 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(stats, user) {
    var inboxIdentifiers, Inbox, inboxUserIdentifiers, inboxUser;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // create Inbox
            inboxIdentifiers = { type: 'user', identifier: user.uid };
            _context4.next = 3;
            return (0, _bluebird.resolve)(new _3.default(inboxIdentifiers).get());

          case 3:
            Inbox = _context4.sent;

            if (Inbox.data) {
              _context4.next = 9;
              break;
            }

            _context4.next = 7;
            return (0, _bluebird.resolve)(Inbox.create());

          case 7:
            stats.usersInboxCreated += 1;
            log('Inbox %o is created', inboxIdentifiers);

          case 9:

            // add InboxUser
            inboxUserIdentifiers = { userUid: user.uid };
            _context4.next = 12;
            return (0, _bluebird.resolve)(Inbox.users.get(inboxUserIdentifiers));

          case 12:
            inboxUser = _context4.sent;

            if (inboxUser.data) {
              _context4.next = 18;
              break;
            }

            _context4.next = 16;
            return (0, _bluebird.resolve)(Inbox.users.add({ userUid: user.uid }));

          case 16:
            stats.inboxUsersAdded += 1;
            log('InboxUser %o is added to inbox %o', inboxUserIdentifiers, inboxIdentifiers);

          case 18:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function syncUser(_x5, _x6) {
    return _ref5.apply(this, arguments);
  };
}();

var syncAgenda = function () {
  var _ref6 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(stats, agenda) {
    var stakeholdersSvc, usersSvc, inboxIdentifiers, Inbox, limit, pos, result, stakeholders, shList, users, userIds, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, user, inboxUserIdentifiers, inboxUser;

    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            stakeholdersSvc = _config.services.stakeholders, usersSvc = _config.services.users;

            // create Inbox

            inboxIdentifiers = { type: 'agenda', identifier: agenda.uid };
            _context5.next = 4;
            return (0, _bluebird.resolve)(new _3.default(inboxIdentifiers).get());

          case 4:
            Inbox = _context5.sent;

            if (Inbox.data) {
              _context5.next = 10;
              break;
            }

            _context5.next = 8;
            return (0, _bluebird.resolve)(Inbox.create());

          case 8:
            stats.agendasInboxCreated += 1;
            log('Inbox %o is created', inboxIdentifiers);

          case 10:

            // add InboxUsers
            limit = 200;
            pos = 0;
            result = void 0;
            stakeholders = [];

            shList = function shList() {
              return (0, _util.promisify)(stakeholdersSvc.agenda(agenda.id).list)({ credentials: ['administrator', 'moderator'] }, pos, limit, { deletedUser: false });
            };

          case 15:
            _context5.next = 17;
            return (0, _bluebird.resolve)(shList());

          case 17:
            if (!(result = _context5.sent)) {
              _context5.next = 24;
              break;
            }

            if (result.length) {
              _context5.next = 20;
              break;
            }

            return _context5.abrupt('break', 24);

          case 20:
            pos = pos + result.length;

            Array.prototype.push.apply(stakeholders, result);
            _context5.next = 15;
            break;

          case 24:

            pos = 0;
            users = [];
            userIds = _lodash2.default.map(stakeholders, 'userId');

          case 27:
            _context5.next = 29;
            return (0, _bluebird.resolve)(usersSvc.list({ id: userIds }, pos, limit, { removed: false }));

          case 29:
            if (!(result = _context5.sent.users)) {
              _context5.next = 36;
              break;
            }

            if (result.length) {
              _context5.next = 32;
              break;
            }

            return _context5.abrupt('break', 36);

          case 32:
            pos = pos + limit;

            Array.prototype.push.apply(users, result);
            _context5.next = 27;
            break;

          case 36:
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context5.prev = 39;
            _iterator3 = (0, _getIterator3.default)(users);

          case 41:
            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
              _context5.next = 55;
              break;
            }

            user = _step3.value;
            inboxUserIdentifiers = { userUid: user.uid };
            _context5.next = 46;
            return (0, _bluebird.resolve)(Inbox.users.get(inboxUserIdentifiers));

          case 46:
            inboxUser = _context5.sent;

            if (inboxUser.data) {
              _context5.next = 52;
              break;
            }

            _context5.next = 50;
            return (0, _bluebird.resolve)(Inbox.users.add({ userUid: user.uid }));

          case 50:
            stats.inboxUsersAdded += 1;
            log('InboxUser %o is added to inbox %o', inboxUserIdentifiers, inboxIdentifiers);

          case 52:
            _iteratorNormalCompletion3 = true;
            _context5.next = 41;
            break;

          case 55:
            _context5.next = 61;
            break;

          case 57:
            _context5.prev = 57;
            _context5.t0 = _context5['catch'](39);
            _didIteratorError3 = true;
            _iteratorError3 = _context5.t0;

          case 61:
            _context5.prev = 61;
            _context5.prev = 62;

            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }

          case 64:
            _context5.prev = 64;

            if (!_didIteratorError3) {
              _context5.next = 67;
              break;
            }

            throw _iteratorError3;

          case 67:
            return _context5.finish(64);

          case 68:
            return _context5.finish(61);

          case 69:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[39, 57, 61, 69], [62,, 64, 68]]);
  }));

  return function syncAgenda(_x7, _x8) {
    return _ref6.apply(this, arguments);
  };
}();

var _util = require('util');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _queue = require('@openagenda/queue');

var _queue2 = _interopRequireDefault(_queue);

var _logs = require('@openagenda/logs');

var _logs2 = _interopRequireDefault(_logs);

var _config = require('../config');

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _logs2.default)('inboxes/tasks/sync');

/*
* - sync route per agenda
* - check on admin/stats page
* - weekly complete task
* */

exports.default = function () {
  var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var q, stats, data;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            q = (0, _queue2.default)(_config.queues.inboxesSync, { redis: _config.redis });
            stats = {
              usersToSync: 0,
              agendasToSync: 0,
              usersInboxCreated: 0,
              agendasInboxCreated: 0,
              inboxUsersAdded: 0
            };
            _context.next = 4;
            return (0, _bluebird.resolve)(q.len());

          case 4:
            if (_context.sent) {
              _context.next = 13;
              break;
            }

            _context.prev = 5;
            _context.next = 8;
            return (0, _bluebird.resolve)(defineJob(stats, q));

          case 8:
            _context.next = 13;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context['catch'](5);
            return _context.abrupt('return', log('error', 'Error on jobs definition', _context.t0));

          case 13:
            data = void 0;

          case 14:
            _context.next = 16;
            return (0, _bluebird.resolve)(q.pop());

          case 16:
            if (!(data = _context.sent)) {
              _context.next = 27;
              break;
            }

            _context.prev = 17;
            _context.next = 20;
            return (0, _bluebird.resolve)(processJob(stats, data));

          case 20:
            _context.next = 25;
            break;

          case 22:
            _context.prev = 22;
            _context.t1 = _context['catch'](17);

            log('error', 'Error on sync process: job n°%d:\n%o', i, data, _context.t1);

          case 25:
            _context.next = 14;
            break;

          case 27:

            log('%d users inbox created', stats.usersInboxCreated);
            log('%d agendas inbox created', stats.agendasInboxCreated);
            log('%d inboxUsers added', stats.inboxUsersAdded);

          case 30:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[5, 10], [17, 22]]);
  }));

  function syncTask() {
    return _ref.apply(this, arguments);
  }

  return syncTask;
}();
//# sourceMappingURL=sync.js.map