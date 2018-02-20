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

var _jsxFileName = 'src/components/ConversationList/ConversationList.js';

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ConversationList: {
    displayName: 'ConversationList'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/ConversationList/ConversationList.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ConversationList = _wrapComponent('ConversationList')(function (_Component) {
  (0, _inherits3.default)(ConversationList, _Component);

  function ConversationList() {
    (0, _classCallCheck3.default)(this, ConversationList);
    return (0, _possibleConstructorReturn3.default)(this, (ConversationList.__proto__ || (0, _getPrototypeOf2.default)(ConversationList)).apply(this, arguments));
  }

  (0, _createClass3.default)(ConversationList, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          conversations = _props.conversations,
          user = _props.user;


      return conversations.map(function (conversation) {
        return _react3.default.createElement(_.ConversationItem, { conversation: conversation, user: user, key: conversation.id, __source: {
            fileName: _jsxFileName,
            lineNumber: 9
          }
        });
      });
    }
  }]);
  return ConversationList;
}(_react2.Component));

exports.default = ConversationList;
module.exports = exports['default'];
//# sourceMappingURL=ConversationList.js.map