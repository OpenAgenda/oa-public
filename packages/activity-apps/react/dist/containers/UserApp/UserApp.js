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

var _user = require('labels/activities/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  AgendaApp: {
    displayName: 'AgendaApp'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/UserApp/UserApp.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var AgendaApp = _wrapComponent('AgendaApp')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    lang: state.settings.lang
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(AgendaApp, _Component);

  function AgendaApp() {
    (0, _classCallCheck3.default)(this, AgendaApp);
    return (0, _possibleConstructorReturn3.default)(this, (AgendaApp.__proto__ || (0, _getPrototypeOf2.default)(AgendaApp)).apply(this, arguments));
  }

  (0, _createClass3.default)(AgendaApp, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var lang = this.props.lang;


      return {
        lang: lang,
        getLabel: function getLabel(label) {
          var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return (0, _labels2.default)(_user2.default)(label, values, lang);
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {

      return _react3.default.createElement(
        'div',
        { className: 'container activity-user top-margined' },
        _react3.default.createElement(
          'div',
          { className: 'wsq' },
          this.props.children
        )
      );
    }
  }]);
  return AgendaApp;
}(_react2.Component), _class2.childContextTypes = {
  lang: _propTypes2.default.string,
  getLabel: _propTypes2.default.func
}, _temp)) || _class));

exports.default = AgendaApp;
module.exports = exports['default'];