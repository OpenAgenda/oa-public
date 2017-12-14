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

var _dec,
    _class,
    _class2,
    _temp,
    _jsxFileName = 'src/components/ConversationItem/ConversationItem.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _reactRedux = require('react-redux');

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ConversationItem: {
    displayName: 'ConversationItem'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/ConversationItem/ConversationItem.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ConversationItem = _wrapComponent('ConversationItem')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    agendaUid: state.agenda && state.agenda.uid
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(ConversationItem, _Component);

  function ConversationItem() {
    (0, _classCallCheck3.default)(this, ConversationItem);
    return (0, _possibleConstructorReturn3.default)(this, (ConversationItem.__proto__ || (0, _getPrototypeOf2.default)(ConversationItem)).apply(this, arguments));
  }

  (0, _createClass3.default)(ConversationItem, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          conversation = _props.conversation,
          agendaUid = _props.agendaUid;
      var getLabel = this.context.getLabel;


      if (!conversation.latestMessage) {
        return null;
      }

      var latestMessage = conversation.latestMessage,
          resolvedAt = conversation.resolvedAt,
          store = conversation.store,
          typeIdentifier = conversation.typeIdentifier;

      var creationDate = (0, _moment2.default)(latestMessage.createdAt);

      return _react3.default.createElement(
        'div',
        { className: 'media', __source: {
            fileName: _jsxFileName,
            lineNumber: 30
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'media-left media-top', __source: {
              fileName: _jsxFileName,
              lineNumber: 31
            }
          },
          _react3.default.createElement(_.AuthorAvatar, { author: latestMessage, __source: {
              fileName: _jsxFileName,
              lineNumber: 32
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'media-body', __source: {
              fileName: _jsxFileName,
              lineNumber: 35
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'media-heading', __source: {
                fileName: _jsxFileName,
                lineNumber: 36
              }
            },
            _react3.default.createElement(
              'b',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 37
                }
              },
              getMessageSenderName(latestMessage)
            ),
            store && store.params && store.params.eventTitle ? _react3.default.createElement(
              _react2.Fragment,
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 38
                }
              },
              ' ',
              _react3.default.createElement(
                'span',
                {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 40
                  }
                },
                _react3.default.createElement(
                  'span',
                  { className: 'text-muted', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 41
                    }
                  },
                  getLabel('aboutEvent')
                ),
                ' ',
                _react3.default.createElement(
                  _.Link,
                  { to: '/agendas/' + store.params.agendaUid + '/events/' + typeIdentifier, external: true, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 42
                    }
                  },
                  store.params.eventTitle
                )
              )
            ) : null,
            resolvedAt ? _react3.default.createElement(
              _react2.Fragment,
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 47
                }
              },
              ' ',
              _react3.default.createElement(
                'div',
                { className: 'tooltip-icon', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 49
                  }
                },
                _react3.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 50
                  }
                }),
                _react3.default.createElement(
                  'div',
                  { className: 'tooltip right', role: 'tooltip', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 51
                    }
                  },
                  _react3.default.createElement('div', { className: 'tooltip-arrow', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 52
                    }
                  }),
                  _react3.default.createElement(
                    'div',
                    { className: 'tooltip-inner', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 53
                      }
                    },
                    getLabel('resolvedConversation')
                  )
                )
              )
            ) : null
          ),
          _react3.default.createElement(
            'div',
            { className: 'margin-bottom-xs', __source: {
                fileName: _jsxFileName,
                lineNumber: 58
              }
            },
            latestMessage.body || null
          ),
          _react3.default.createElement(
            'p',
            { className: 'text-muted', title: creationDate.format('LLL'), __source: {
                fileName: _jsxFileName,
                lineNumber: 61
              }
            },
            getLabel('messagePostedRelativeDate', { date: creationDate.fromNow(true) }),
            ' ',
            _react3.default.createElement(
              _.Link,
              {
                to: '/conversation/' + conversation.id,
                className: 'margin-left-xs',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 63
                }
              },
              getLabel('viewConversation')
            )
          )
        )
      );
    }
  }]);
  return ConversationItem;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func
}, _temp)) || _class));

exports.default = ConversationItem;


function getMessageSenderName(message) {
  if (message.inboxUser) {
    return message.inboxUser.name;
  }

  return message.inbox.name;
}
module.exports = exports['default'];
//# sourceMappingURL=ConversationItem.js.map