"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = function (options) {
  var _Object$assign = (0, _assign2.default)({
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
      { className: 'list-unstyled activity-list' },
      activities.map(function (a) {
        return _react2.default.createElement(_components2.ActivityItem, { key: 'activity.' + a.id, activity: a, lang: lang });
      })
    )
  );
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('moment/locale/fr');

var _components2 = require('../../components');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
//# sourceMappingURL=index.js.map