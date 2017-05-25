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

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Menu = _wrapComponent('Menu')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    lang: state.settings.lang,
    prefix: state.settings.prefix,
    tab: state.menu.tab
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(Menu, _Component);

  function Menu() {
    _classCallCheck(this, Menu);

    return _possibleConstructorReturn(this, (Menu.__proto__ || Object.getPrototypeOf(Menu)).apply(this, arguments));
  }

  _createClass(Menu, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          res = _props.res,
          tab = _props.tab,
          prefix = _props.prefix,
          creationButton = _props.creationButton;
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
            { to: prefix || '/' },
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