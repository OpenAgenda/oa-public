"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (options) {
  var _Object$assign = Object.assign({
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
        )
      ),
      notifications.map(function (v) {
        return _extends({ notification: v }, formatNotification(v, lang));
      }).map(function (_ref) {
        var notification = _ref.notification,
            content = _ref.content,
            url = _ref.url;
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
          _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: content } }),
          _react2.default.createElement(
            'div',
            { className: 'datetime text-muted' },
            ucfirst((0, _moment2.default)(notification.createdAt).locale(lang).fromNow())
          )
        );
      }),
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

module.exports = exports['default'];