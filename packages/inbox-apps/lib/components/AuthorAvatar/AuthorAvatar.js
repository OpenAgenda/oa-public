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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _index = require('../index');

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
      var _props = this.props,
          _props$author = _props.author,
          inboxUser = _props$author.inboxUser,
          inbox = _props$author.inbox,
          inline = _props.inline;


      var imgClasses = (0, _classnames2.default)('img-circle', {
        'media-object': !inline
      });

      var principalStyle = {
        width: inline ? '24px' : '60px',
        verticalAlign: 'bottom'
      };

      if (inboxUser) {
        return _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 19
            }
          },
          _react3.default.createElement(_index.Image, {
            src: inboxUser.avatar,
            fallbackSrc: __DEVELOPMENT__ ? inboxUser.avatar.replace('cibuldev', 'cibul') : null,
            className: imgClasses,
            style: principalStyle,
            title: inboxUser.name,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 20
            }
          }),
          !inline && inbox && inbox.avatar && inbox.type !== 'user' ? _react3.default.createElement(_index.Image, {
            src: inbox.avatar,
            fallbackSrc: __DEVELOPMENT__ ? inbox.avatar.replace('cibuldev', 'cibul') : null,
            className: (0, _classnames2.default)(imgClasses, 'belongs'),
            style: { width: inline ? '10px' : '25px' },
            title: inbox.name,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 29
            }
          }) : null
        );
      }

      return _react3.default.createElement(_index.Image, {
        src: inbox.avatar,
        fallbackSrc: __DEVELOPMENT__ ? inbox.avatar.replace('cibuldev', 'cibul') : null,
        className: imgClasses,
        style: principalStyle,
        title: inbox.name,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 41
        }
      });
    }
  }]);
  return AuthorAvatar;
}(_react2.Component));

exports.default = AuthorAvatar;
module.exports = exports['default'];
//# sourceMappingURL=AuthorAvatar.js.map