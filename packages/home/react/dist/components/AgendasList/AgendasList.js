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

var _class, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Image = require('@openagenda/react-components/build/Image');

var _Image2 = _interopRequireDefault(_Image);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  (0, _inherits3.default)(AgendasList, _Component);

  function AgendasList() {
    (0, _classCallCheck3.default)(this, AgendasList);
    return (0, _possibleConstructorReturn3.default)(this, (AgendasList.__proto__ || (0, _getPrototypeOf2.default)(AgendasList)).apply(this, arguments));
  }

  (0, _createClass3.default)(AgendasList, [{
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
              _react3.default.createElement(_Image2.default, {
                src: agenda.image,
                fallbackSrc: agenda.image.replace('cibuldev', 'cibul'),
                className: 'media-object ill avatar',
                alt: agenda.title
              })
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