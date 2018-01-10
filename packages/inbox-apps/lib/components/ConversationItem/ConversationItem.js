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

var _find2 = require('lodash/find');

var _find3 = _interopRequireDefault(_find2);

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

var _nl2br = require('@openagenda/react-utils/dist/nl2br');

var _nl2br2 = _interopRequireDefault(_nl2br);

var _2 = require('../');

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
    settings: state.settings
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(ConversationItem, _Component);

  function ConversationItem() {
    (0, _classCallCheck3.default)(this, ConversationItem);
    return (0, _possibleConstructorReturn3.default)(this, (ConversationItem.__proto__ || (0, _getPrototypeOf2.default)(ConversationItem)).apply(this, arguments));
  }

  (0, _createClass3.default)(ConversationItem, [{
    key: 'renderTitle',
    value: function renderTitle() {
      var _props = this.props,
          conversation = _props.conversation,
          maskEventTitle = _props.settings.maskEventTitle;
      var getLabel = this.context.getLabel;
      var resolvedAt = conversation.resolvedAt,
          store = conversation.store,
          type = conversation.type,
          typeIdentifier = conversation.typeIdentifier;


      var creator = {
        inbox: conversation.creatorInbox,
        inboxUser: conversation.creatorInboxUser
      };

      var resolvedIcon = resolvedAt ? _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 31
          }
        },
        ' ',
        _react3.default.createElement(
          'div',
          { className: 'tooltip-icon', __source: {
              fileName: _jsxFileName,
              lineNumber: 33
            }
          },
          _react3.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true', __source: {
              fileName: _jsxFileName,
              lineNumber: 34
            }
          }),
          _react3.default.createElement(
            'div',
            { className: 'tooltip right', role: 'tooltip', __source: {
                fileName: _jsxFileName,
                lineNumber: 35
              }
            },
            _react3.default.createElement('div', { className: 'tooltip-arrow', __source: {
                fileName: _jsxFileName,
                lineNumber: 36
              }
            }),
            _react3.default.createElement(
              'div',
              { className: 'tooltip-inner', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 37
                }
              },
              getLabel('resolvedConversation')
            )
          )
        )
      ) : null;

      if (type === 'request_contribute') {
        var contextInbox = getContextInbox(conversation);

        if (contextInbox.type === 'agenda') {
          return _react3.default.createElement(
            _react2.Fragment,
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 47
              }
            },
            _react3.default.createElement(
              'b',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 48
                }
              },
              getInboxUserName(creator)
            ),
            ' ',
            getLabel('wouldLikeToContribute'),
            resolvedIcon
          );
        }

        return _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 55
            }
          },
          getLabel('requestForContribution'),
          ' ',
          _react3.default.createElement(
            'b',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 56
              }
            },
            store.params.agendaTitle
          ),
          resolvedIcon
        );
      }

      return _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 63
          }
        },
        getLabel('createdBy'),
        ' ',
        _react3.default.createElement(_2.AuthorAvatar, { author: creator, inline: true, __source: {
            fileName: _jsxFileName,
            lineNumber: 65
          }
        }),
        ' ',
        _react3.default.createElement(
          'b',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 66
            }
          },
          getInboxUserName(creator)
        ),
        !maskEventTitle && store && store.params && store.params.eventTitle ? _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 67
            }
          },
          ' ',
          _react3.default.createElement(
            'span',
            { className: 'text-muted', __source: {
                fileName: _jsxFileName,
                lineNumber: 69
              }
            },
            getLabel('aboutEvent')
          ),
          ' ',
          _react3.default.createElement(
            _2.Link,
            { to: '/agendas/' + store.params.agendaUid + '/events/' + typeIdentifier, external: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 70
              }
            },
            store.params.eventTitle
          )
        ) : null,
        resolvedIcon
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var conversation = this.props.conversation;
      var getLabel = this.context.getLabel;


      if (!conversation.latestMessage) {
        return null;
      }

      var latestMessage = conversation.latestMessage,
          inboxes = conversation.inboxes,
          inboxContextId = conversation.inboxContextId;

      var creationDate = (0, _moment2.default)(latestMessage.createdAt);

      var destinationInbox = inboxes.filter(function (v) {
        return v.id !== inboxContextId;
      }).sort(function (o) {
        return Number(o.type === 'agenda');
      }).shift();

      return _react3.default.createElement(
        'div',
        { className: 'media', __source: {
            fileName: _jsxFileName,
            lineNumber: 96
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'media-left media-top', __source: {
              fileName: _jsxFileName,
              lineNumber: 97
            }
          },
          _react3.default.createElement(_2.AuthorAvatar, { author: { inbox: destinationInbox }, __source: {
              fileName: _jsxFileName,
              lineNumber: 98
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'media-body', __source: {
              fileName: _jsxFileName,
              lineNumber: 101
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'media-heading margin-bottom-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 102
              }
            },
            this.renderTitle()
          ),
          _react3.default.createElement(
            'div',
            { className: 'margin-bottom-xs', __source: {
                fileName: _jsxFileName,
                lineNumber: 105
              }
            },
            _react3.default.createElement(
              'sup',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 106
                }
              },
              _react3.default.createElement('i', { className: 'fa fa-quote-left text-muted', 'aria-hidden': 'true', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 106
                }
              })
            ),
            '\u2002',
            latestMessage.body ? (0, _nl2br2.default)(latestMessage.body) : null
          ),
          _react3.default.createElement(
            'p',
            { title: creationDate.format('LLL'), __source: {
                fileName: _jsxFileName,
                lineNumber: 109
              }
            },
            _react3.default.createElement(
              'span',
              { className: 'text-muted', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 110
                }
              },
              getLabel('lastMessagePostedRelativeDate', { date: creationDate.fromNow(true) }),
              ' ',
              getLabel('by')
            ),
            ' ',
            _react3.default.createElement(_2.AuthorAvatar, { author: latestMessage, inline: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 114
              }
            }),
            ' ',
            getInboxUserName(latestMessage),
            _react3.default.createElement('br', {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 116
              }
            }),
            _react3.default.createElement(
              _2.Link,
              { to: '/conversation/' + conversation.id, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 117
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


function getInboxUserName(message) {
  if (message.inboxUser) {
    return message.inboxUser.name;
  }

  return message.inbox.name;
}

function getCreatorName(conversation) {
  if (conversation.creatorInboxUser) {
    return conversation.creatorInboxUser.name;
  }

  return conversation.creatorInbox.name;
}

function getContextInbox(conversation) {
  return (0, _find3.default)(conversation.inboxes, ['id', conversation.inboxContextId]);
}
module.exports = exports['default'];
//# sourceMappingURL=ConversationItem.js.map