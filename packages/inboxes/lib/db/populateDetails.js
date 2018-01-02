'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _bluebird = require('bluebird');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Inbox = require('../Inbox');

var _Inbox2 = _interopRequireDefault(_Inbox);

var _config = require('../config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(entities, inbox) {
    var _this = this;

    var result, listsToPopulate, usersDetails, inboxesDetails;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(entities === null)) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return', null);

          case 2:
            if (Array.isArray(entities)) {
              _context2.next = 6;
              break;
            }

            _context2.next = 5;
            return (0, _bluebird.resolve)(populateDetails([entities], inbox));

          case 5:
            return _context2.abrupt('return', _context2.sent[0]);

          case 6:
            _context2.next = 8;
            return (0, _bluebird.resolve)((0, _bluebird.all)(entities.map(function () {
              var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(row) {
                var inboxUser, creatorInboxUser;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (row.inboxUserId) {
                          delete row.inboxUserId;
                        }
                        if (row.creatorInboxUserId) {
                          delete row.creatorInboxUserId;
                        }

                        if (!(row.inboxUser && row.inboxUser.inboxId !== inbox.data.id)) {
                          _context.next = 12;
                          break;
                        }

                        if (!(inbox.data.type === 'user')) {
                          _context.next = 9;
                          break;
                        }

                        _context.next = 6;
                        return (0, _bluebird.resolve)(new _Inbox2.default(row.inboxUser.inboxId).users.get({ userUid: inbox.data.identifier }));

                      case 6:
                        _context.t0 = _context.sent;
                        _context.next = 10;
                        break;

                      case 9:
                        _context.t0 = null;

                      case 10:
                        inboxUser = _context.t0;


                        if (!inboxUser || !inboxUser.data) {
                          delete row.inboxUser;
                        }

                      case 12:
                        if (!(row.creatorInboxUser && row.creatorInboxUser.inboxId !== inbox.data.id)) {
                          _context.next = 22;
                          break;
                        }

                        if (!(inbox.data.type === 'user')) {
                          _context.next = 19;
                          break;
                        }

                        _context.next = 16;
                        return (0, _bluebird.resolve)(new _Inbox2.default(row.creatorInboxUser.inboxId).users.get({ userUid: inbox.data.identifier }));

                      case 16:
                        _context.t1 = _context.sent;
                        _context.next = 20;
                        break;

                      case 19:
                        _context.t1 = null;

                      case 20:
                        creatorInboxUser = _context.t1;


                        if (!creatorInboxUser || !creatorInboxUser.data) {
                          delete row.creatorInboxUser;
                        }

                      case 22:
                        return _context.abrupt('return', row);

                      case 23:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              }));

              return function (_x3) {
                return _ref2.apply(this, arguments);
              };
            }())));

          case 8:
            result = _context2.sent;
            listsToPopulate = result.reduce(function (prev, row) {
              if (row.inboxUser) {
                prev.users.push(row.inboxUser);
              }
              if (row.inbox) {
                prev.inboxes.push(row.inbox);
              }

              if (row.creatorInboxUser) {
                prev.users.push(row.creatorInboxUser);
              }
              if (row.creatorInbox) {
                prev.inboxes.push(row.creatorInbox);
              }

              return prev;
            }, { users: [], inboxes: [] });


            listsToPopulate.users = _lodash2.default.uniqWith(listsToPopulate.users, _lodash2.default.isEqual);
            listsToPopulate.inboxes = _lodash2.default.uniqWith(listsToPopulate.inboxes, _lodash2.default.isEqual);

            _context2.next = 14;
            return (0, _bluebird.resolve)(_config.interfaces.getUsersDetails(listsToPopulate.users));

          case 14:
            usersDetails = _context2.sent;
            _context2.next = 17;
            return (0, _bluebird.resolve)(_config.interfaces.getInboxesDetails(listsToPopulate.inboxes));

          case 17:
            inboxesDetails = _context2.sent;
            return _context2.abrupt('return', result.map(function (entity) {
              var inboxUserIndex = entity.inboxUser ? usersDetails.findIndex(function (v) {
                return entity.inboxUser.userUid === v.uid;
              }) : -1;
              var inboxIndex = entity.inbox ? inboxesDetails.findIndex(function (v) {
                return entity.inbox.identifier === v.uid;
              }) : -1;

              var creatorInboxUserIndex = entity.creatorInboxUser ? usersDetails.findIndex(function (v) {
                return entity.creatorInboxUser.userUid === v.uid;
              }) : -1;
              var creatorInboxIndex = entity.creatorInbox ? inboxesDetails.findIndex(function (v) {
                return entity.creatorInbox.identifier === v.uid;
              }) : -1;

              if (inboxUserIndex !== -1) {
                (0, _assign2.default)(entity.inboxUser, usersDetails[inboxUserIndex]);
              }
              if (inboxIndex !== -1) {
                (0, _assign2.default)(entity.inbox, inboxesDetails[inboxIndex]);
              }

              if (creatorInboxUserIndex !== -1) {
                (0, _assign2.default)(entity.creatorInboxUser, usersDetails[creatorInboxUserIndex]);
              }
              if (creatorInboxIndex !== -1) {
                (0, _assign2.default)(entity.creatorInbox, inboxesDetails[creatorInboxIndex]);
              }

              return entity;
            }));

          case 19:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  function populateDetails(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return populateDetails;
}();

module.exports = exports['default'];
//# sourceMappingURL=populateDetails.js.map