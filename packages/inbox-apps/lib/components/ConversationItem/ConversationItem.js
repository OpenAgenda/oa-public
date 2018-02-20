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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _reactRedux = require('react-redux');

var _nl2br = require('@openagenda/react-utils/dist/nl2br');

var _nl2br2 = _interopRequireDefault(_nl2br);

var _ = require('../');

var _getDestinationInbox = require('../../utils/getDestinationInbox');

var _getDestinationInbox2 = _interopRequireDefault(_getDestinationInbox);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

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

  function ConversationItem(props) {
    (0, _classCallCheck3.default)(this, ConversationItem);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ConversationItem.__proto__ || (0, _getPrototypeOf2.default)(ConversationItem)).call(this, props));

    _this.TitleEntityComponent = _this.TitleEntityComponent.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(ConversationItem, [{
    key: 'renderAuthorSentence',
    value: function renderAuthorSentence(_ref) {
      var destinationInbox = _ref.destinationInbox;
      var getLabel = this.context.getLabel;
      var _props = this.props,
          user = _props.user,
          conversation = _props.conversation;
      var latestMessage = conversation.latestMessage;


      var creationDate = (0, _moment2.default)(latestMessage.createdAt);
      var firstMessage = creationDate.diff((0, _moment2.default)(conversation.createdAt), 'seconds') <= 1;
      var creator = {
        inbox: conversation.creatorInbox,
        inboxUser: conversation.creatorInboxUser
      };

      if (firstMessage) {
        return _react3.default.createElement(
          'div',
          { className: 'margin-bottom-sm padding-top-xs text-muted', title: creationDate.format('LLL'), __source: {
              fileName: _jsxFileName,
              lineNumber: 40
            }
          },
          getLabel('postedAgo', { date: creationDate.fromNow(true) })
        );
      } else {
        if (isCreator(creator, user)) {
          return _react3.default.createElement(
            'div',
            { className: 'margin-bottom-sm padding-top-xs text-muted', title: creationDate.format('LLL'), __source: {
                fileName: _jsxFileName,
                lineNumber: 47
              }
            },
            getLabel('youRepliedAgo', { date: creationDate.fromNow(true) })
          );
        } else {
          return _react3.default.createElement(
            'div',
            {
              className: (0, _classnames2.default)('margin-bottom-sm', 'text-muted', { 'padding-top-xs': destinationInbox.id === latestMessage.inbox.id }),
              title: creationDate.format('LLL'),
              __source: {
                fileName: _jsxFileName,
                lineNumber: 53
              }
            },
            destinationInbox.id !== latestMessage.inbox.id ? _react3.default.createElement(
              _react2.Fragment,
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 63
                }
              },
              _react3.default.createElement(_.AuthorAvatar, { author: latestMessage, inline: true, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 64
                }
              }),
              ' '
            ) : null,
            getInboxUserName(latestMessage),
            ' ',
            getLabel('repliedAgo', { date: creationDate.fromNow(true) })
          );
        }
      }
    }
  }, {
    key: 'TitleEntityComponent',
    value: function TitleEntityComponent(_ref2) {
      var children = _ref2.children,
          type = _ref2.type,
          agendaUid = _ref2.agendaUid,
          eventUid = _ref2.eventUid,
          locationUid = _ref2.locationUid;
      var context = this.props.settings.context;


      switch (type) {
        case 'agenda':
          return _react3.default.createElement(
            _.Link,
            { to: '/agendas/' + agendaUid, external: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 81
              }
            },
            children
          );
        case 'event':
          return _react3.default.createElement(
            _.Link,
            { to: '/agendas/' + agendaUid + '/events/' + eventUid, external: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 83
              }
            },
            children
          );
        case 'location':
          if (context === 'agenda') {
            return _react3.default.createElement(
              _.Link,
              {
                to: '/agendas/' + agendaUid + '/admin/locations?uids[]=' + locationUid,
                className: 'conversation-title-entity',
                external: true,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 87
                }
              },
              children
            );
          }
        default:
          return _react3.default.createElement(
            'b',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 97
              }
            },
            children
          );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          user = _props2.user,
          conversation = _props2.conversation;
      var getLabel = this.context.getLabel;


      if (!conversation.latestMessage) {
        return null;
      }

      var latestMessage = conversation.latestMessage,
          resolvedAt = conversation.resolvedAt;


      var destinationInbox = (0, _getDestinationInbox2.default)({ user: user, conversation: conversation });

      var resolvedIcon = resolvedAt ? _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 113
          }
        },
        ' ',
        _react3.default.createElement(
          'div',
          { className: 'tooltip-icon', __source: {
              fileName: _jsxFileName,
              lineNumber: 115
            }
          },
          _react3.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true', __source: {
              fileName: _jsxFileName,
              lineNumber: 116
            }
          }),
          _react3.default.createElement(
            'div',
            { className: 'tooltip right', role: 'tooltip', __source: {
                fileName: _jsxFileName,
                lineNumber: 117
              }
            },
            _react3.default.createElement('div', { className: 'tooltip-arrow', __source: {
                fileName: _jsxFileName,
                lineNumber: 118
              }
            }),
            _react3.default.createElement(
              'div',
              { className: 'tooltip-inner', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 119
                }
              },
              getLabel('resolvedConversation')
            )
          )
        )
      ) : null;

      return _react3.default.createElement(
        'div',
        { className: 'media conversation-item', __source: {
            fileName: _jsxFileName,
            lineNumber: 125
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'media-left media-top', __source: {
              fileName: _jsxFileName,
              lineNumber: 126
            }
          },
          _react3.default.createElement(_.AuthorAvatar, { author: { inbox: destinationInbox }, __source: {
              fileName: _jsxFileName,
              lineNumber: 127
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'media-body', __source: {
              fileName: _jsxFileName,
              lineNumber: 130
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'media-heading margin-bottom-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 131
              }
            },
            _react3.default.createElement(_.ConversationTitle, {
              user: user,
              conversation: conversation,
              EntityComponent: this.TitleEntityComponent,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 132
              }
            }),
            resolvedIcon
          ),
          _react3.default.createElement(
            'div',
            { className: 'conversation-item-message margin-bottom-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 140
              }
            },
            this.renderAuthorSentence({ destinationInbox: destinationInbox }),
            _react3.default.createElement('div', {
              className: 'message padding-bottom-xs',
              dangerouslySetInnerHTML: { __html: (0, _marked2.default)(latestMessage.body, { breaks: true }) },
              __source: {
                fileName: _jsxFileName,
                lineNumber: 143
              }
            })
          ),
          _react3.default.createElement(
            _.Link,
            { to: '/conversation/' + conversation.id, __source: {
                fileName: _jsxFileName,
                lineNumber: 149
              }
            },
            getLabel('viewConversation')
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


function getInboxUserName(entity) {
  if (entity.inboxUser) {
    return entity.inboxUser.name;
  }

  return entity.inbox.name;
}

function isCreator(creator, user) {
  if (creator.inboxUser && creator.inboxUser.userUid === user.uid) {
    return true;
  }

  if (creator.inbox.type === 'user' && creator.inbox.identifier === user.uid) {
    return true;
  }

  return false;
}
module.exports = exports['default'];
//# sourceMappingURL=ConversationItem.js.map