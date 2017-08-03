"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = function (options) {
  var _Object$assign = (0, _assign2.default)({
    notifications: [],
    userUid: null,
    lang: 'fr'
  }, options),
      lang = _Object$assign.lang,
      notifications = _Object$assign.notifications,
      userUid = _Object$assign.userUid;

  var formatNotification = (0, _formatNotification2.default)(null, _notifications2.default, userUid);

  var getLabel = (0, _labels2.default)(_notifications2.default, lang);

  return _react2.default.createElement(
    'div',
    { className: 'notifications-body' },
    _react2.default.createElement(
      'div',
      { className: 'list-group' },
      notifications && notifications.length > 0 && _react2.default.createElement(
        'div',
        { className: 'list-group-item read-all-item' },
        _react2.default.createElement(
          'div',
          { className: 'pull-left' },
          _react2.default.createElement(
            'button',
            { className: 'btn btn-link see-activities' },
            getLabel('viewAllActivities')
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'text-right' },
          _react2.default.createElement(
            'button',
            { className: 'btn btn-link read-all' },
            getLabel('markAllAsRead')
          )
        )
      ),
      !notifications || !notifications.length && _react2.default.createElement(
        'div',
        { className: 'list-group-item no-notif' },
        _react2.default.createElement(
          'div',
          { className: 'text-center padding-all-sm' },
          getLabel('noNotif')
        ),
        _react2.default.createElement(
          'button',
          { className: 'btn btn-link see-activities center-block' },
          getLabel('viewAllActivities')
        )
      ),
      notifications.map(function (v) {
        return (0, _extends3.default)({ notification: v }, formatNotification(v, lang), { lang: lang });
      }).map(renderNotification),
      notifications && notifications.length > 0 && _react2.default.createElement(
        'div',
        { className: 'list-group-item next-item' },
        _react2.default.createElement(
          'div',
          { className: 'text-center' },
          _react2.default.createElement(
            'button',
            { className: 'btn btn-link next' },
            getLabel('next')
          )
        )
      )
    )
  );
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _notifications = require('labels/activities/notifications');

var _notifications2 = _interopRequireDefault(_notifications);

var _labels = require('labels');

var _labels2 = _interopRequireDefault(_labels);

var _formatNotification = require('activities/formatNotification');

var _formatNotification2 = _interopRequireDefault(_formatNotification);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment/locale/fr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ucfirst = function ucfirst(s) {
  return s.substr(0, 1).toUpperCase() + s.substring(1);
};

function renderNotification(_ref) {
  var notification = _ref.notification,
      content = _ref.content,
      url = _ref.url,
      lang = _ref.lang;


  var date = (0, _moment2.default)(notification.createdAt);
  var now = (0, _moment2.default)();

  if (date.diff(now) > 0) {
    date = now;
  }

  return _react2.default.createElement(
    'a',
    {
      href: url,
      className: (0, _classnames2.default)('list-group-item', { read: notification.state === 2 }),
      key: notification.id,
      'data-id': notification.id
    },
    _react2.default.createElement(
      'div',
      { className: 'pull-right' },
      _react2.default.createElement(
        'button',
        { className: 'btn btn-link remove' },
        _react2.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' })
      ),
      _react2.default.createElement(
        'button',
        { className: 'btn btn-link mark-read' },
        _react2.default.createElement('i', { className: 'fa fa-check-circle', 'aria-hidden': 'true' })
      )
    ),
    _react2.default.createElement('div', { className: 'notif-item', dangerouslySetInnerHTML: { __html: content } }),
    _react2.default.createElement(
      'div',
      { className: 'datetime text-muted' },
      ucfirst(date.locale(lang).fromNow())
    )
  );
}
module.exports = exports['default'];
//# sourceMappingURL=index.js.map