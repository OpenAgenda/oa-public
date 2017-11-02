'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec, _dec2, _class, _class2, _temp2;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxConnect = require('redux-connect');

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _home = require('@openagenda/labels/home');

var _home2 = _interopRequireDefault(_home);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Collapse = require('react-bootstrap/lib/Collapse');

var _Collapse2 = _interopRequireDefault(_Collapse);

var _components2 = require('../../components');

var _agendas = require('../../redux/modules/agendas');

var agendasActions = _interopRequireWildcard(_agendas);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  App: {
    displayName: 'App'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/App/App.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ucfirst = function ucfirst(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

var App = _wrapComponent('App')((_dec = (0, _reduxConnect.asyncConnect)([{
  deferred: !__CLIENT__,
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState;

    var state = getState();
    var query = state.routing.locationBeforeTransitions.query;
    var promises = [];

    if (!agendasActions.isLoaded('homeAgendas', state)) {
      promises.push(dispatch(agendasActions.load('homeAgendas', query)));
    }

    return _promise2.default.all(__CLIENT__ ? [] : promises);
  }
}]), _dec2 = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    lang: state.settings.lang,
    isNew: state.settings.isNew,
    prefix: state.settings.prefix,
    tab: state.menu.tab,
    total: state.agendas.homeAgendas.total
  };
}), _dec(_class = _dec2(_class = (_temp2 = _class2 = function (_Component) {
  (0, _inherits3.default)(App, _Component);

  function App() {
    var _ref2;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, App);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref2 = App.__proto__ || (0, _getPrototypeOf2.default)(App)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
      menuOpen: false
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(App, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var lang = this.props.lang;


      return {
        lang: lang,
        getLabel: function getLabel(label) {
          return (0, _labels2.default)(_home2.default)(label, lang);
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          res = _props.res,
          tab = _props.tab,
          isNew = _props.isNew,
          prefix = _props.prefix,
          total = _props.total;

      var _getChildContext = this.getChildContext(),
          getLabel = _getChildContext.getLabel;

      if (isNew && !total) {
        return _react3.default.createElement(
          'div',
          { className: 'container top-margined home' },
          _react3.default.createElement(
            'div',
            { className: 'col-sm-8 col-sm-offset-2' },
            _react3.default.createElement(
              'div',
              { className: 'row wsq' },
              _react3.default.createElement(
                'div',
                { className: 'content' },
                this.props.children
              )
            )
          )
        );
      }

      return _react3.default.createElement(
        'div',
        { className: (0, _classnames2.default)('container top-margined home', (0, _defineProperty3.default)({}, 'home-' + tab, tab)) },
        _react3.default.createElement(
          'div',
          { className: 'row wsq' },
          _react3.default.createElement(
            'div',
            { className: 'col-sm-3 col-sm-push-9' },
            _react3.default.createElement(
              'div',
              { className: 'visible-xs-block' },
              ' ',
              _react3.default.createElement(
                'div',
                { className: 'row header' },
                _react3.default.createElement(
                  'h2',
                  null,
                  getLabel('my' + ucfirst(tab))
                ),
                _react3.default.createElement(
                  'div',
                  { className: 'pull-right' },
                  _react3.default.createElement(
                    'button',
                    { className: 'btn btn-default btn-collapse-nav', type: 'button',
                      onClick: function onClick() {
                        return _this2.setState({ menuOpen: !_this2.state.menuOpen });
                      }
                    },
                    _react3.default.createElement('i', { className: 'fa fa-bars', 'aria-hidden': 'true' })
                  )
                )
              ),
              _react3.default.createElement(
                _Collapse2.default,
                { 'in': this.state.menuOpen },
                _react3.default.createElement(
                  'div',
                  { className: 'row' },
                  _react3.default.createElement(
                    'div',
                    { className: 'nav' },
                    _react3.default.createElement(_components2.Menu, null)
                  )
                )
              )
            ),
            _react3.default.createElement(
              'div',
              { className: 'hidden-xs' },
              ' ',
              _react3.default.createElement(
                'div',
                { className: 'row' },
                _react3.default.createElement(
                  'div',
                  { className: 'nav nav-right' },
                  _react3.default.createElement(_components2.Menu, { creationButton: false })
                )
              )
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'col-sm-9 col-sm-pull-3 content' },
            this.props.children
          )
        )
      );
    }
  }]);
  return App;
}(_react2.Component), _class2.childContextTypes = {
  lang: _propTypes2.default.string,
  getLabel: _propTypes2.default.func
}, _temp2)) || _class) || _class));

exports.default = App;
module.exports = exports['default'];
//# sourceMappingURL=App.js.map