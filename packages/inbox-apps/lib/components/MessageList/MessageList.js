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

var _jsxFileName = 'src/components/MessageList/MessageList.js';

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  MessageList: {
    displayName: 'MessageList'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/MessageList/MessageList.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var MessageList = _wrapComponent('MessageList')(function (_Component) {
  (0, _inherits3.default)(MessageList, _Component);

  function MessageList() {
    (0, _classCallCheck3.default)(this, MessageList);
    return (0, _possibleConstructorReturn3.default)(this, (MessageList.__proto__ || (0, _getPrototypeOf2.default)(MessageList)).apply(this, arguments));
  }

  (0, _createClass3.default)(MessageList, [{
    key: 'render',
    value: function render() {
      var messages = this.props.messages;


      return messages.map(function (message) {
        return _react3.default.createElement(_.MessageItem, { message: message, key: message.id, __source: {
            fileName: _jsxFileName,
            lineNumber: 9
          }
        });
      });
    }
  }]);
  return MessageList;
}(_react2.Component));

exports.default = MessageList;
module.exports = exports['default'];
//# sourceMappingURL=MessageList.js.map