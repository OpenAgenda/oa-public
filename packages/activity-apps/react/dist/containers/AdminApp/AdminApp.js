'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _labels = require('labels');

var _labels2 = _interopRequireDefault(_labels);

var _admin = require('labels/activities/admin');

var _admin2 = _interopRequireDefault(_admin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
  _inherits(AdminApp, _Component);

  function AdminApp() {
    _classCallCheck(this, AdminApp);

    return _possibleConstructorReturn(this, (AdminApp.__proto__ || Object.getPrototypeOf(AdminApp)).apply(this, arguments));
  }

  _createClass(AdminApp, [{
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