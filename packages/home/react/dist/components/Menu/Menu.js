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

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reduxForm = require('redux-form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Menu: {
    displayName: 'Menu'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/Menu/Menu.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var selector = (0, _reduxForm.formValueSelector)('homeAgendas');

var Menu = _wrapComponent('Menu')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    agendasSearch: selector(state, 'search'),
    res: state.res,
    lang: state.settings.lang,
    prefix: state.settings.prefix,
    tab: state.menu.tab
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(Menu, _Component);

  function Menu() {
    (0, _classCallCheck3.default)(this, Menu);
    return (0, _possibleConstructorReturn3.default)(this, (Menu.__proto__ || (0, _getPrototypeOf2.default)(Menu)).apply(this, arguments));
  }

  (0, _createClass3.default)(Menu, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          res = _props.res,
          tab = _props.tab,
          prefix = _props.prefix,
          creationButton = _props.creationButton,
          agendasSearch = _props.agendasSearch;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'ul',
        { className: 'list-unstyled' },
        creationButton && _react3.default.createElement(
          'li',
          { className: 'menu-item' },
          _react3.default.createElement(
            'a',
            { href: res.agendas.create, className: 'btn btn-primary create-agenda' },
            getLabel('createAgenda')
          )
        ),
        _react3.default.createElement(
          'li',
          { className: (0, _classnames2.default)('menu-item', { selected: tab === 'agendas' }) },
          _react3.default.createElement(
            _reactRouter.Link,
            { to: { pathname: prefix || '/', query: { search: agendasSearch || undefined } } },
            getLabel('myAgendas')
          )
        ),
        _react3.default.createElement(
          'li',
          { className: (0, _classnames2.default)('menu-item', { selected: tab === 'events' }) },
          _react3.default.createElement(
            _reactRouter.Link,
            { to: prefix + '/events' },
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
      );
    }
  }]);
  return Menu;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func
}, _class2.defaultProps = {
  creationButton: true
}, _temp)) || _class));

exports.default = Menu;
module.exports = exports['default'];
//# sourceMappingURL=Menu.js.map