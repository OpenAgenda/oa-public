'use strict';

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

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _labels = require('labels');

var _labels2 = _interopRequireDefault(_labels);

var _admin = require('labels/activities/admin');

var _admin2 = _interopRequireDefault(_admin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  AdminApp: {
    displayName: 'AdminApp'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/AdminApp/AdminApp.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var AdminApp = _wrapComponent('AdminApp')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    lang: state.settings.lang
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(AdminApp, _Component);

  function AdminApp() {
    (0, _classCallCheck3.default)(this, AdminApp);
    return (0, _possibleConstructorReturn3.default)(this, (AdminApp.__proto__ || (0, _getPrototypeOf2.default)(AdminApp)).apply(this, arguments));
  }

  (0, _createClass3.default)(AdminApp, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var lang = this.props.lang;


      return {
        lang: lang,
        getLabel: function getLabel(label) {
          var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return (0, _labels2.default)(_admin2.default)(label, values, lang);
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {

      return _react3.default.createElement(
        'div',
        { className: 'activity-admin' },
        this.props.children
      );
    }
  }]);
  return AdminApp;
}(_react2.Component), _class2.childContextTypes = {
  lang: _propTypes2.default.string,
  getLabel: _propTypes2.default.func
}, _temp)) || _class));

exports.default = AdminApp;
module.exports = exports['default'];