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

var _dec,
    _dec2,
    _class,
    _jsxFileName = 'src/containers/App/App.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _recompose = require('recompose');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _inboxes = require('@openagenda/labels/inboxes');

var _inboxes2 = _interopRequireDefault(_inboxes);

require('moment/locale/fr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  App: {
    displayName: 'App'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/containers/App/App.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var App = _wrapComponent('App')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    settings: state.settings
  };
}), _dec2 = (0, _recompose.withContext)({
  lang: _propTypes2.default.string,
  getLabel: _propTypes2.default.func
}, function (_ref) {
  var settings = _ref.settings;
  return {
    lang: settings.lang,
    getLabel: function getLabel(label) {
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (0, _labels2.default)(_inboxes2.default)(label, values, settings.lang);
    }
  };
}), _dec(_class = _dec2(_class = function (_Component) {
  (0, _inherits3.default)(App, _Component);

  function App() {
    (0, _classCallCheck3.default)(this, App);
    return (0, _possibleConstructorReturn3.default)(this, (App.__proto__ || (0, _getPrototypeOf2.default)(App)).apply(this, arguments));
  }

  (0, _createClass3.default)(App, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      _moment2.default.locale(this.props.lang || 'fr');
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          Wrapper = _props.settings.Wrapper,
          children = _props.children;


      if (Wrapper) {
        return _react3.default.createElement(
          Wrapper,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 37
            }
          },
          children
        );
      }

      return children;
    }
  }]);
  return App;
}(_react2.Component)) || _class) || _class));

exports.default = App;
module.exports = exports['default'];
//# sourceMappingURL=App.js.map