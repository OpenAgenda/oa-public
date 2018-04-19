"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _formatActivity = require('@openagenda/activities/dist/formatActivity');

var _formatActivity2 = _interopRequireDefault(_formatActivity);

var _user = require('@openagenda/labels/activities/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ActivityItem: {
    displayName: 'ActivityItem'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/react/components/ActivityItem.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var formatActivity = (0, _formatActivity2.default)({}, _user2.default);

var ActivityItem = _wrapComponent('ActivityItem')(function (_Component) {
  (0, _inherits3.default)(ActivityItem, _Component);

  function ActivityItem() {
    (0, _classCallCheck3.default)(this, ActivityItem);
    return (0, _possibleConstructorReturn3.default)(this, (ActivityItem.__proto__ || (0, _getPrototypeOf2.default)(ActivityItem)).apply(this, arguments));
  }

  (0, _createClass3.default)(ActivityItem, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          activity = _props.activity,
          lang = _props.lang,
          withFilterIcons = _props.withFilterIcons;


      var formatArgs = [activity];

      if (lang) formatArgs.push(lang);

      if (withFilterIcons) formatArgs.push(withFilterIcons);

      return _react3.default.createElement(
        'li',
        null,
        _react3.default.createElement('span', { className: 'activity-info activity-item', dangerouslySetInnerHTML: { __html: formatActivity.apply(null, formatArgs) } }),
        _react3.default.createElement(
          'span',
          { className: 'activity-time' },
          (0, _moment2.default)(activity.createdAt).format('LLL')
        )
      );
    }
  }]);
  return ActivityItem;
}(_react2.Component));

exports.default = ActivityItem;
module.exports = exports['default'];
//# sourceMappingURL=ActivityItem.js.map