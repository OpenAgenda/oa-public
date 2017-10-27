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

var _class, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  AgendasList: {
    displayName: 'AgendasList'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/AgendasList/AgendasList.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var componentPropTypes = _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.func, _propTypes2.default.string]);

var AgendasList = _wrapComponent('AgendasList')((_temp = _class = function (_Component) {
  _inherits(AgendasList, _Component);

  function AgendasList() {
    _classCallCheck(this, AgendasList);

    return _possibleConstructorReturn(this, (AgendasList.__proto__ || Object.getPrototypeOf(AgendasList)).apply(this, arguments));
  }

  _createClass(AgendasList, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          WrapperComponent = _props.WrapperComponent,
          ActionsComponent = _props.ActionsComponent,
          agendas = _props.agendas,
          getTitleLink = _props.getTitleLink;
      var getLabel = this.context.getLabel;


      return (0, _react2.createElement)(WrapperComponent, {}, agendas && agendas.map(function (agenda, i) {
        return _react3.default.createElement(
          'div',
          { className: 'agenda-item media', key: i },
          _react3.default.createElement(
            'div',
            { className: 'media-left' },
            _react3.default.createElement(
              'a',
              { href: getTitleLink(agenda) },
              _react3.default.createElement('img', { className: 'media-object ill avatar', src: agenda.image, alt: agenda.title })
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'media-body' },
            _react3.default.createElement(
              'div',
              { className: 'title media-heading' },
              _react3.default.createElement(
                'a',
                { href: getTitleLink(agenda) },
                _react3.default.createElement(
                  'strong',
                  null,
                  agenda.title
                )
              ),
              !!agenda.official && _react3.default.createElement(
                'div',
                { className: 'official' },
                _react3.default.createElement('i', null),
                _react3.default.createElement(
                  'div',
                  { className: 'tooltip right', role: 'tooltip' },
                  _react3.default.createElement('div', { className: 'tooltip-arrow' }),
                  _react3.default.createElement(
                    'div',
                    { className: 'tooltip-inner' },
                    getLabel('officialAgenda')
                  )
                )
              ),
              !!agenda.private && _react3.default.createElement(
                'div',
                { className: 'tooltip-icon' },
                _react3.default.createElement('i', { className: 'fa fa-unlock-alt' }),
                _react3.default.createElement(
                  'div',
                  { className: 'tooltip right', role: 'tooltip' },
                  _react3.default.createElement('div', { className: 'tooltip-arrow' }),
                  _react3.default.createElement(
                    'div',
                    { className: 'tooltip-inner' },
                    getLabel('privateAgenda')
                  )
                )
              )
            ),
            (0, _react2.createElement)(ActionsComponent, { agenda: agenda })
          )
        );
      }));
    }
  }]);

  return AgendasList;
}(_react2.Component), _class.propTypes = {
  WrapperComponent: componentPropTypes,
  ActionsComponent: componentPropTypes,
  agendas: _propTypes2.default.array,
  getTitleLink: _propTypes2.default.func
}, _class.contextTypes = {
  getLabel: _propTypes2.default.func
}, _class.defaultProps = {
  WrapperComponent: 'div',
  ActionsComponent: function ActionsComponent() {
    return null;
  }
}, _temp));

exports.default = AgendasList;
module.exports = exports['default'];
//# sourceMappingURL=AgendasList.js.map