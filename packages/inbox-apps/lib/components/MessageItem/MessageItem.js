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

var _class,
    _temp,
    _jsxFileName = 'src/components/MessageItem/MessageItem.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  MessageItem: {
    displayName: 'MessageItem'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/MessageItem/MessageItem.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var MessageItem = _wrapComponent('MessageItem')((_temp = _class = function (_Component) {
  (0, _inherits3.default)(MessageItem, _Component);

  function MessageItem() {
    (0, _classCallCheck3.default)(this, MessageItem);
    return (0, _possibleConstructorReturn3.default)(this, (MessageItem.__proto__ || (0, _getPrototypeOf2.default)(MessageItem)).apply(this, arguments));
  }

  (0, _createClass3.default)(MessageItem, [{
    key: 'render',
    value: function render() {
      var message = this.props.message;
      var getLabel = this.context.getLabel;


      if (!message) {
        return null;
      }

      var creationDate = (0, _moment2.default)(message.createdAt);

      return _react3.default.createElement(
        'div',
        { className: 'media', __source: {
            fileName: _jsxFileName,
            lineNumber: 23
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'media-left media-top', __source: {
              fileName: _jsxFileName,
              lineNumber: 24
            }
          },
          _react3.default.createElement(_.MessageAvatar, { message: message, __source: {
              fileName: _jsxFileName,
              lineNumber: 25
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'media-body', __source: {
              fileName: _jsxFileName,
              lineNumber: 28
            }
          },
          _react3.default.createElement(
            'p',
            { className: 'media-heading', __source: {
                fileName: _jsxFileName,
                lineNumber: 29
              }
            },
            _react3.default.createElement(
              'b',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 30
                }
              },
              getMessageSenderName(message)
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'margin-bottom-xs', __source: {
                fileName: _jsxFileName,
                lineNumber: 32
              }
            },
            message.body || null
          ),
          _react3.default.createElement(
            'p',
            { className: 'text-muted', title: creationDate.format('LLL'), __source: {
                fileName: _jsxFileName,
                lineNumber: 35
              }
            },
            getLabel('messagePostedRelativeDate', { date: creationDate.fromNow(true) })
          )
        )
      );
    }
  }]);
  return MessageItem;
}(_react2.Component), _class.contextTypes = {
  getLabel: _propTypes2.default.func
}, _temp));

exports.default = MessageItem;


function getMessageSenderName(message) {
  if (message.inboxUser) {
    return message.inboxUser.name;
  }

  return message.inbox.name;
}
module.exports = exports['default'];
//# sourceMappingURL=MessageItem.js.map