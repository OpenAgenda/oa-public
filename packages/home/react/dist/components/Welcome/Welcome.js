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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Welcome: {
    displayName: 'Welcome'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/Welcome/Welcome.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var Welcome = _wrapComponent('Welcome')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(Welcome, _Component);

  function Welcome() {
    (0, _classCallCheck3.default)(this, Welcome);
    return (0, _possibleConstructorReturn3.default)(this, (Welcome.__proto__ || (0, _getPrototypeOf2.default)(Welcome)).apply(this, arguments));
  }

  (0, _createClass3.default)(Welcome, [{
    key: 'render',
    value: function render() {
      var res = this.props.res;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        { className: 'row' },
        _react3.default.createElement(
          'div',
          { className: 'text-center new-user padding-v-md' },
          _react3.default.createElement(
            'h2',
            { className: 'margin-v-md' },
            getLabel('welcome')
          ),
          _react3.default.createElement(
            'a',
            { href: res.agendas.create, className: 'btn btn-primary margin-v-sm' },
            getLabel('createAgenda')
          ),
          _react3.default.createElement(
            'p',
            { className: 'margin-v-sm' },
            getLabel('orContributeToExisting')
          ),
          _react3.default.createElement(
            'form',
            { action: res.search, method: 'GET', className: 'margin-top-sm' },
            _react3.default.createElement(
              'div',
              { className: 'form-group input-icon-right search center-block' },
              _react3.default.createElement(
                'div',
                { className: 'input-icon-right' },
                _react3.default.createElement('input', { type: 'text', name: 'search', className: 'form-control' }),
                _react3.default.createElement(
                  'button',
                  { type: 'submit', className: 'btn' },
                  _react3.default.createElement('i', { className: 'fa fa-search', 'aria-hidden': 'true' })
                )
              )
            )
          )
        )
      );
    }
  }]);
  return Welcome;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func
}, _temp)) || _class));

exports.default = Welcome;
module.exports = exports['default'];
//# sourceMappingURL=Welcome.js.map