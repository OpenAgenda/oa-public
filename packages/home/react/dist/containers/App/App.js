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

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _labels = require('labels');

var _labels2 = _interopRequireDefault(_labels);

var _agendas = require('labels/home/agendas');

var _agendas2 = _interopRequireDefault(_agendas);

var _Collapse = require('react-bootstrap/lib/Collapse');

var _Collapse2 = _interopRequireDefault(_Collapse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var selector = (0, _reduxForm.formValueSelector)('homeDashboard');

var App = _wrapComponent('App')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    lang: state.settings.lang,
    agendas: state.agendas.data,
    search: selector(state, 'search')
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

    _this.state = {
      menuOpen: false
    };
    return _this;
  }

  _createClass(App, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var lang = this.props.lang;


      return {
        lang: lang,
        getLabel: function getLabel(label) {
          return (0, _labels2.default)(_agendas2.default)(label, lang);
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props;
      var agendas = _props.agendas;
      var res = _props.res;
      var search = _props.search;
      var query = _props.location.query;

      var _getChildContext = this.getChildContext();

      var getLabel = _getChildContext.getLabel;

      var newUser = !search && !query.search && (!agendas || !agendas.length);

      if (newUser) {
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
        { className: 'container top-margined home' },
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
                  getLabel('myAgendas')
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
                    _react3.default.createElement(
                      'ul',
                      { className: 'list-unstyled' },
                      _react3.default.createElement(
                        'li',
                        { className: 'menu-item' },
                        _react3.default.createElement(
                          'a',
                          { href: res.new, className: 'btn btn-primary create-agenda' },
                          getLabel('createAgenda')
                        )
                      ),
                      _react3.default.createElement(
                        'li',
                        { className: 'menu-item selected' },
                        _react3.default.createElement(
                          'a',
                          null,
                          getLabel('myAgendas')
                        )
                      ),
                      _react3.default.createElement(
                        'li',
                        { className: 'menu-item' },
                        _react3.default.createElement(
                          'a',
                          { href: res.events },
                          getLabel('myEvents')
                        )
                      ),
                      _react3.default.createElement(
                        'li',
                        { className: 'menu-item' },
                        _react3.default.createElement(
                          'a',
                          { href: res.messages },
                          getLabel('messages')
                        )
                      ),
                      _react3.default.createElement(
                        'li',
                        { className: 'menu-item' },
                        _react3.default.createElement(
                          'a',
                          { href: res.notifs },
                          getLabel('notifications')
                        )
                      )
                    )
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
                  _react3.default.createElement(
                    'ul',
                    { className: 'list-unstyled' },
                    _react3.default.createElement(
                      'li',
                      { className: 'menu-item selected' },
                      _react3.default.createElement(
                        'a',
                        null,
                        getLabel('myAgendas')
                      )
                    ),
                    _react3.default.createElement(
                      'li',
                      { className: 'menu-item' },
                      _react3.default.createElement(
                        'a',
                        { href: res.events },
                        getLabel('myEvents')
                      )
                    ),
                    _react3.default.createElement(
                      'li',
                      { className: 'menu-item' },
                      _react3.default.createElement(
                        'a',
                        { href: res.messages },
                        getLabel('messages')
                      )
                    ),
                    _react3.default.createElement(
                      'li',
                      { className: 'menu-item' },
                      _react3.default.createElement(
                        'a',
                        { href: res.notifs },
                        getLabel('notifications')
                      )
                    )
                  )
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
  lang: _react2.PropTypes.string,
  getLabel: _react2.PropTypes.func
}, _temp)) || _class));

exports.default = App;
module.exports = exports['default'];