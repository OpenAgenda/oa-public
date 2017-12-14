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

var _jsxFileName = 'src/components/AuthorAvatar/AuthorAvatar.js';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  AuthorAvatar: {
    displayName: 'AuthorAvatar'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/AuthorAvatar/AuthorAvatar.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var AuthorAvatar = _wrapComponent('AuthorAvatar')(function (_Component) {
  (0, _inherits3.default)(AuthorAvatar, _Component);

  function AuthorAvatar() {
    (0, _classCallCheck3.default)(this, AuthorAvatar);
    return (0, _possibleConstructorReturn3.default)(this, (AuthorAvatar.__proto__ || (0, _getPrototypeOf2.default)(AuthorAvatar)).apply(this, arguments));
  }

  (0, _createClass3.default)(AuthorAvatar, [{
    key: 'render',
    value: function render() {
      var _props$author = this.props.author,
          inboxUser = _props$author.inboxUser,
          inbox = _props$author.inbox;


      if (inboxUser) {
        return _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 8
            }
          },
          _react3.default.createElement('img', {
            src: inboxUser.avatar,
            className: 'media-object img-circle',
            style: { width: '60px' },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 9
            }
          }),
          inbox && inbox.avatar && inbox.type !== 'user' ? _react3.default.createElement('img', {
            src: inbox.avatar,
            className: 'media-object img-circle belongs',
            style: { width: '25px' },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 16
            }
          }) : null
        );
      }

      return _react3.default.createElement('img', {
        src: inbox.avatar,
        className: 'media-object img-circle',
        style: { width: '60px' },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26
        }
      });
    }
  }]);
  return AuthorAvatar;
}(_react2.Component));

exports.default = AuthorAvatar;
module.exports = exports['default'];
//# sourceMappingURL=AuthorAvatar.js.map