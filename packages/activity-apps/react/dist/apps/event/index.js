"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  var _Object$assign = Object.assign({
    activities: [],
    lang: 'fr'
  }, options),
      lang = _Object$assign.lang,
      activities = _Object$assign.activities;

  return _react2.default.createElement(
    'div',
    null,
    activities && activities.length > 0 && _react2.default.createElement(
      'ul',
      { className: 'list-unstyled' },
      activities.map(function (activity) {
        return _react2.default.createElement(
          'li',
          { key: activity.id, className: 'padding-bottom-xs' },
          _react2.default.createElement(
            'label',
            { className: 'pull-left margin-right-sm small' },
            (0, _moment2.default)(activity.createdAt).locale(lang).format('LLL')
          ),
          _react2.default.createElement('p', { dangerouslySetInnerHTML: { __html: formatActivity(activity, lang) } })
        );
      })
    )
  );
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _event = require('labels/activities/event');

var _event2 = _interopRequireDefault(_event);

var _format = require('activities/format');

var _format2 = _interopRequireDefault(_format);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment/locale/fr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const getLabel = ( label, values = {} ) => makeGetterLabel( labels )( label, values, lang );

// import makeGetterLabel from 'labels';
var formatActivity = (0, _format2.default)({}, _event2.default);

module.exports = exports['default'];