'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _class,
    _temp,
    _jsxFileName = 'src/components/ActionsList/ActionsList.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ActionsList: {
    displayName: 'ActionsList'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/ActionsList/ActionsList.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ActionsList = _wrapComponent('ActionsList')((_temp = _class = function (_Component) {
  (0, _inherits3.default)(ActionsList, _Component);

  function ActionsList() {
    (0, _classCallCheck3.default)(this, ActionsList);
    return (0, _possibleConstructorReturn3.default)(this, (ActionsList.__proto__ || (0, _getPrototypeOf2.default)(ActionsList)).apply(this, arguments));
  }

  (0, _createClass3.default)(ActionsList, [{
    key: 'getActionLabel',
    value: function getActionLabel(action) {
      var lang = this.context.lang;


      if (action.label[lang]) {
        return action.label[lang];
      }

      return action.label[(0, _keys2.default)(action.label)[0]];
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          actions = _props.actions,
          onAction = _props.onAction;


      if (!actions) {
        return null;
      }

      return actions.map(function (action) {
        return _react3.default.createElement(
          'div',
          { className: 'margin-top-sm', key: action.code, __source: {
              fileName: _jsxFileName,
              lineNumber: 29
            }
          },
          _react3.default.createElement(
            'button',
            {
              className: (0, _classnames2.default)('btn', 'btn-block', (0, _defineProperty3.default)({}, 'btn-' + action.kind, !!action.kind)),
              onClick: function onClick() {
                return onAction(action.code);
              },
              __source: {
                fileName: _jsxFileName,
                lineNumber: 30
              }
            },
            _this2.getActionLabel(action)
          )
        );
      });
    }
  }]);
  return ActionsList;
}(_react2.Component), _class.contextTypes = {
  lang: _propTypes2.default.string
}, _temp));

exports.default = ActionsList;
;
module.exports = exports['default'];
//# sourceMappingURL=ActionsList.js.map