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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

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
    value: function renderTitle(_ref) {
      var destinationInbox = _ref.destinationInbox;
      var _props = this.props,
          user = _props.user,
          conversation = _props.conversation,
          context = _props.settings.context;
      var getLabel = this.context.getLabel;
      var store = conversation.store,
          type = conversation.type;


      var creator = {
        inbox: conversation.creatorInbox,
        inboxUser: conversation.creatorInboxUser
      };

      switch (type) {
        case 'event':
          switch (context) {
            case 'event':
              {
                if (isCreator(creator, user)) {
                  if (destinationInbox.type === 'user') {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 38
                        }
                      },
                      getLabel('youContactedTheContributor')
                    );
                  } else {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 40
                        }
                      },
                      getLabel('youContactedTheAgenda')
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user') {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 45
                        }
                      },
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 46
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      getLabel('contactedTheContributor')
                    );
                  } else {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 50
                        }
                      },
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 50
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      getLabel('contactedTheAgenda')
                    );
                  }
                }
              }
            case 'agenda':
              {
                if (isCreator(creator, user)) {
                  if (destinationInbox.type === 'user') {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 58
                        }
                      },
                      getLabel('youContactedTheContributor'),
                      ' ',
                      getLabel('of'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 60
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  } else {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 65
                        }
                      },
                      getLabel('youContactedTheAgenda'),
                      ' ',
                      getLabel('on'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 67
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user') {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 74
                        }
                      },
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 75
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      getLabel('contactedTheContributor'),
                      ' ',
                      getLabel('of'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 76
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  } else {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 81
                        }
                      },
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 82
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      getLabel('contactedTheAgenda'),
                      ' ',
                      getLabel('on'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 83
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  }
                }
              }
            case 'user':
              {
                if (isCreator(creator, user)) {
                  if (destinationInbox.type === 'user') {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 93
                        }
                      },
                      getLabel('youContactedTheContributor'),
                      ' ',
                      getLabel('of'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 95
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  } else {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 100
                        }
                      },
                      getLabel('youContactedTheAgenda'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 101
                          }
                        },
                        store.params.agendaTitle
                      ),
                      ' ',
                      getLabel('on'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 102
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user') {
                    // TODO
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 109
                        }
                      },
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 110
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      getLabel('contactedTheContributor'),
                      ' ',
                      getLabel('of'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 111
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  } else {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 116
                        }
                      },
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 117
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      getLabel('contactedTheAgenda'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 118
                          }
                        },
                        store.params.agendaTitle
                      ),
                      ' ',
                      getLabel('on'),
                      ' ',
                      _react3.default.createElement(
                        'b',
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 119
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  }
                }
              }
          }
        case 'contact_form':
          switch (context) {
            case 'agenda':
              if (isCreator(creator, user)) {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 130
                    }
                  },
                  getLabel('youContactedTheAgenda')
                );
              } else {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 133
                    }
                  },
                  _react3.default.createElement(
                    'b',
                    {
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 134
                      }
                    },
                    getInboxUserName(creator)
                  ),
                  ' ',
                  getLabel('contactedTheAgenda')
                );
              }
            case 'user':
              if (isCreator(creator, user)) {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 140
                    }
                  },
                  getLabel('youContactedTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    'b',
                    {
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 140
                      }
                    },
                    store.params.agendaTitle
                  )
                );
              } else {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 143
                    }
                  },
                  _react3.default.createElement(
                    'b',
                    {
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 144
                      }
                    },
                    getInboxUserName(creator)
                  ),
                  ' ',
                  getLabel('contactedTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    'b',
                    {
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 145
                      }
                    },
                    store.params.agendaTitle
                  )
                );
              }
          }
        case 'request_contribute':
          switch (context) {
            case 'agenda':
              if (isCreator(creator, user)) {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 154
                    }
                  },
                  getLabel('youWantToContributeToTheAgenda')
                );
              } else {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 157
                    }
                  },
                  _react3.default.createElement(
                    'b',
                    {
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 158
                      }
                    },
                    getInboxUserName(creator)
                  ),
                  ' ',
                  getLabel('wantsToContributeToTheAgenda')
                );
              }
            case 'user':
              if (isCreator(creator, user)) {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 165
                    }
                  },
                  getLabel('youWantToContributeToTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    'b',
                    {
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 167
                      }
                    },
                    store.params.agendaTitle
                  )
                );
              } else {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 172
                    }
                  },
                  _react3.default.createElement(
                    'b',
                    {
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 173
                      }
                    },
                    getInboxUserName(creator)
                  ),
                  ' ',
                  getLabel('wantsToContributeToTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    'b',
                    {
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 174
                      }
                    },
                    store.params.agendaTitle
                  )
                );
              }
          }
      }

      return _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 182
          }
        },
        getLabel('createdBy'),
        ' ',
        _react3.default.createElement(
          'b',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 185
            }
          },
          getInboxUserName(creator)
        )
      );
    }
  }, {
    key: 'renderAuthorSentence',
    value: function renderAuthorSentence(_ref2) {
      var destinationInbox = _ref2.destinationInbox;
      var getLabel = this.context.getLabel;
      var _props2 = this.props,
          user = _props2.user,
          conversation = _props2.conversation;
      var latestMessage = conversation.latestMessage;


      var creationDate = (0, _moment2.default)(latestMessage.createdAt);
      var firstMessage = latestMessage.createdAt === conversation.createdAt;
      var creator = {
        inbox: conversation.creatorInbox,
        inboxUser: conversation.creatorInboxUser
      };

      if (firstMessage) {
        return _react3.default.createElement(
          'div',
          { className: 'margin-bottom-sm padding-top-xs text-muted', title: creationDate.format('LLL'), __source: {
              fileName: _jsxFileName,
              lineNumber: 204
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
                lineNumber: 211
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
                lineNumber: 217
              }
            },
            destinationInbox.id !== latestMessage.inbox.id ? _react3.default.createElement(_2.AuthorAvatar, { author: latestMessage, inline: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 226
              }
            }) : null,
            getInboxUserName(latestMessage),
            ' ',
            getLabel('repliedAgo', { date: creationDate.fromNow(true) })
          );
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          user = _props3.user,
          conversation = _props3.conversation;
      var getLabel = this.context.getLabel;


      if (!conversation.latestMessage) {
        return null;
      }

      var latestMessage = conversation.latestMessage,
          inboxes = conversation.inboxes,
          inboxContextId = conversation.inboxContextId,
          resolvedAt = conversation.resolvedAt;


      var destinationInbox = getDestinationInbox({ user: user, inboxes: inboxes, inboxContextId: inboxContextId });

      var resolvedIcon = resolvedAt ? _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 248
          }
        },
        ' ',
        _react3.default.createElement(
          'div',
          { className: 'tooltip-icon', __source: {
              fileName: _jsxFileName,
              lineNumber: 250
            }
          },
          _react3.default.createElement('i', { className: 'fa fa-check', 'aria-hidden': 'true', __source: {
              fileName: _jsxFileName,
              lineNumber: 251
            }
          }),
          _react3.default.createElement(
            'div',
            { className: 'tooltip right', role: 'tooltip', __source: {
                fileName: _jsxFileName,
                lineNumber: 252
              }
            },
            _react3.default.createElement('div', { className: 'tooltip-arrow', __source: {
                fileName: _jsxFileName,
                lineNumber: 253
              }
            }),
            _react3.default.createElement(
              'div',
              { className: 'tooltip-inner', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 254
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
            lineNumber: 260
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'media-left media-top', __source: {
              fileName: _jsxFileName,
              lineNumber: 261
            }
          },
          _react3.default.createElement(_2.AuthorAvatar, { author: { inbox: destinationInbox }, __source: {
              fileName: _jsxFileName,
              lineNumber: 262
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'media-body', __source: {
              fileName: _jsxFileName,
              lineNumber: 265
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'media-heading margin-bottom-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 266
              }
            },
            this.renderTitle({ destinationInbox: destinationInbox }),
            resolvedIcon
          ),
          _react3.default.createElement(
            'div',
            { className: 'conversation-item-message margin-bottom-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 270
              }
            },
            this.renderAuthorSentence({ destinationInbox: destinationInbox }),
            _react3.default.createElement(
              'div',
              { className: 'message padding-bottom-xs', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 273
                }
              },
              latestMessage.body ? (0, _nl2br2.default)(latestMessage.body) : null
            )
          ),
          _react3.default.createElement(
            _2.Link,
            { to: '/conversation/' + conversation.id, __source: {
                fileName: _jsxFileName,
                lineNumber: 279
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

function getCreatorName(conversation) {
  if (conversation.creatorInboxUser) {
    return conversation.creatorInboxUser.name;
  }

  return conversation.creatorInbox.name;
}

function getContextInbox(conversation) {
  return (0, _find3.default)(conversation.inboxes, ['id', conversation.inboxContextId]);
}

function getDestinationInbox(_ref3) {
  var user = _ref3.user,
      inboxes = _ref3.inboxes,
      inboxContextId = _ref3.inboxContextId;

  var _inboxes = inboxes.sort(function (o) {
    return Number(o.type === 'agenda');
  }).filter(function (v) {
    return !(v.type === 'user' && v.identifier === user.uid);
  });

  return _inboxes.filter(function (v) {
    return v.id !== inboxContextId;
  })[0] || _inboxes[0];
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