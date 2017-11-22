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

var _jsxFileName = 'src/components/MessageAvatar/MessageAvatar.js';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  MessageAvatar: {
    displayName: 'MessageAvatar'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/MessageAvatar/MessageAvatar.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var MessageAvatar = _wrapComponent('MessageAvatar')(function (_Component) {
  (0, _inherits3.default)(MessageAvatar, _Component);

  function MessageAvatar() {
    (0, _classCallCheck3.default)(this, MessageAvatar);
    return (0, _possibleConstructorReturn3.default)(this, (MessageAvatar.__proto__ || (0, _getPrototypeOf2.default)(MessageAvatar)).apply(this, arguments));
  }

  (0, _createClass3.default)(MessageAvatar, [{
    key: 'render',
    value: function render() {
      var message = this.props.message;


      if (message.inboxUser) {
        return [_react3.default.createElement('img', {
          src: message.inboxUser.avatar,
          className: 'media-object img-circle',
          style: { width: '60px' },
          key: 1,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 9
          }
        }), message.inbox && message.inbox.avatar ? _react3.default.createElement('img', {
          src: message.inbox.avatar,
          className: 'media-object img-circle belongs',
          style: { width: '25px' },
          key: 2,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 17
          }
        }) : null];
      }

      return _react3.default.createElement('img', {
        src: message.inbox.avatar,
        className: 'media-object img-circle',
        style: { width: '60px' },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 28
        }
      });
    }
  }]);
  return MessageAvatar;
}(_react2.Component));

exports.default = MessageAvatar;
module.exports = exports['default'];
//# sourceMappingURL=MessageAvatar.js.map