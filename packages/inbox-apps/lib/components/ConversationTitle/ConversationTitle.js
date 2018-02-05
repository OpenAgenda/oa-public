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
    _dec2,
    _class,
    _class2,
    _temp,
    _jsxFileName = 'src/components/ConversationTitle/ConversationTitle.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _recompose = require('recompose');

var _reactRedux = require('react-redux');

var _getDestinationInbox = require('../../utils/getDestinationInbox');

var _getDestinationInbox2 = _interopRequireDefault(_getDestinationInbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ConversationTitle: {
    displayName: 'ConversationTitle'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/components/ConversationTitle/ConversationTitle.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ConversationTitle = _wrapComponent('ConversationTitle')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    settings: state.settings
  };
}), _dec2 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(ConversationTitle, _Component);

  function ConversationTitle() {
    (0, _classCallCheck3.default)(this, ConversationTitle);
    return (0, _possibleConstructorReturn3.default)(this, (ConversationTitle.__proto__ || (0, _getPrototypeOf2.default)(ConversationTitle)).apply(this, arguments));
  }

  (0, _createClass3.default)(ConversationTitle, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          user = _props.user,
          conversation = _props.conversation,
          EntityComponent = _props.EntityComponent,
          context = _props.settings.context,
          getLabel = _props.getLabel;


      var destinationInbox = (0, _getDestinationInbox2.default)({ user: user, conversation: conversation });

      var store = conversation.store,
          type = conversation.type,
          typeIdentifier = conversation.typeIdentifier;


      var creator = {
        inbox: conversation.creatorInbox,
        inboxUser: conversation.creatorInboxUser
      };

      var userIsInConversation = isInInboxes(conversation.inboxes, user);

      switch (type) {
        case 'event':
          switch (context) {
            case 'event':
              {
                if (isUser(creator, user)) {
                  if (destinationInbox.type === 'user') {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 41
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
                          lineNumber: 43
                        }
                      },
                      getLabel('youContactedTheAgenda')
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id || destinationInbox.type === 'agenda' && destinationInbox.id === creator.inbox.id) {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 51
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 52
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      userIsInConversation ? getLabel('contactedYou') : getLabel('contactedTheContributor')
                    );
                  } else {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 60
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 61
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
                if (isUser(creator, user)) {
                  if (destinationInbox.type === 'user') {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 72
                        }
                      },
                      getLabel('youContactedTheContributorOf'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 74
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
                      getLabel('youContactedTheAgenda'),
                      ' ',
                      getLabel('on'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 83
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id || destinationInbox.type === 'agenda' && destinationInbox.id === creator.inbox.id) {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 95
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 96
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      userIsInConversation ? _react3.default.createElement(
                        _react2.Fragment,
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 98
                          }
                        },
                        getLabel('contactedYou'),
                        ' ',
                        getLabel('on'),
                        ' '
                      ) : _react3.default.createElement(
                        _react2.Fragment,
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 102
                          }
                        },
                        getLabel('contactedTheContributor'),
                        ' ',
                        getLabel('of'),
                        ' '
                      ),
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 106
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
                          lineNumber: 113
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 114
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
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 117
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
                if (isUser(creator, user)) {
                  if (destinationInbox.type === 'user') {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 129
                        }
                      },
                      getLabel('youContactedTheContributorOf'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 131
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
                          lineNumber: 138
                        }
                      },
                      getLabel('youContactedTheAgenda'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'agenda', agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 140
                          }
                        },
                        store.params.agendaTitle
                      ),
                      ' ',
                      getLabel('on'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 144
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id || destinationInbox.type === 'agenda' && destinationInbox.id === creator.inbox.id) {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 156
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 157
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      userIsInConversation ? _react3.default.createElement(
                        _react2.Fragment,
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 159
                          }
                        },
                        getLabel('contactedYou'),
                        ' ',
                        getLabel('on'),
                        ' '
                      ) : _react3.default.createElement(
                        _react2.Fragment,
                        {
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 163
                          }
                        },
                        getLabel('contactedTheContributor'),
                        ' ',
                        getLabel('of'),
                        ' '
                      ),
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 167
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
                          lineNumber: 174
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 175
                          }
                        },
                        getInboxUserName(creator)
                      ),
                      ' ',
                      getLabel('contactedTheAgenda'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'agenda', agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 177
                          }
                        },
                        store.params.agendaTitle
                      ),
                      ' ',
                      getLabel('on'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 181
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
              if (isUser(creator, user)) {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 194
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
                      lineNumber: 197
                    }
                  },
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'user', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 198
                      }
                    },
                    getInboxUserName(creator)
                  ),
                  ' ',
                  getLabel('contactedTheAgenda')
                );
              }
            case 'user':
              if (isUser(creator, user)) {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 206
                    }
                  },
                  getLabel('youContactedTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'agenda', agendaUid: typeIdentifier, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 208
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
                      lineNumber: 215
                    }
                  },
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'user', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 216
                      }
                    },
                    getInboxUserName(creator)
                  ),
                  ' ',
                  getLabel('contactedTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'agenda', agendaUid: typeIdentifier, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 218
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
              if (isUser(creator, user)) {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 229
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
                      lineNumber: 232
                    }
                  },
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'user', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 233
                      }
                    },
                    getInboxUserName(creator)
                  ),
                  ' ',
                  getLabel('wantsToContributeToTheAgenda')
                );
              }
            case 'user':
              if (isUser(creator, user)) {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 241
                    }
                  },
                  getLabel('youWantToContributeToTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'agenda', agendaUid: typeIdentifier, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 243
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
                      lineNumber: 250
                    }
                  },
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'user', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 251
                      }
                    },
                    getInboxUserName(creator)
                  ),
                  ' ',
                  getLabel('wantsToContributeToTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'agenda', agendaUid: typeIdentifier, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 253
                      }
                    },
                    store.params.agendaTitle
                  )
                );
              }
          }
      }
    }
  }]);
  return ConversationTitle;
}(_react2.Component), _class2.defaultProps = {
  EntityComponent: function EntityComponent(_ref) {
    var children = _ref.children;
    return _react3.default.createElement(
      'span',
      { className: 'text-muted', __source: {
          fileName: _jsxFileName,
          lineNumber: 15
        }
      },
      children
    );
  }
}, _temp)) || _class) || _class));

exports.default = ConversationTitle;


function getInboxUserName(entity) {
  if (entity.inboxUser) {
    return entity.inboxUser.name;
  }

  return entity.inbox.name;
}

function isUser(entity, user) {
  if (entity.inboxUser && entity.inboxUser.userUid === user.uid) {
    return true;
  }

  if (entity.inbox.type === 'user' && entity.inbox.identifier === user.uid) {
    return true;
  }

  return false;
}

function isInInboxes(inboxes, user) {
  return inboxes.some(function (inbox) {
    return isUser({ inbox: inbox }, user);
  });
}
module.exports = exports['default'];
//# sourceMappingURL=ConversationTitle.js.map