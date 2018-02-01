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
                          lineNumber: 39
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
                          lineNumber: 41
                        }
                      },
                      getLabel('youContactedTheAgenda')
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id) {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 46
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 47
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
                          lineNumber: 55
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 56
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
                          lineNumber: 67
                        }
                      },
                      getLabel('youContactedTheContributorOf'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 69
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
                          lineNumber: 76
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
                            lineNumber: 78
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id) {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 87
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 88
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
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 91
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
                          lineNumber: 98
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 99
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
                            lineNumber: 102
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
                          lineNumber: 114
                        }
                      },
                      getLabel('youContactedTheContributorOf'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 116
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
                          lineNumber: 123
                        }
                      },
                      getLabel('youContactedTheAgenda'),
                      ' ',
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'agenda', agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 125
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
                            lineNumber: 129
                          }
                        },
                        store.params.eventTitle
                      )
                    );
                  }
                } else {
                  if (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id) {
                    return _react3.default.createElement(
                      _react2.Fragment,
                      {
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 138
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 139
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
                        EntityComponent,
                        { type: 'event', eventUid: typeIdentifier, agendaUid: store.params.agendaUid, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 142
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
                          lineNumber: 149
                        }
                      },
                      _react3.default.createElement(
                        EntityComponent,
                        { type: 'user', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 150
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
                            lineNumber: 152
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
                            lineNumber: 156
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
                      lineNumber: 169
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
                      lineNumber: 172
                    }
                  },
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'user', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 173
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
                      lineNumber: 181
                    }
                  },
                  getLabel('youContactedTheAgenda'),
                  ' ',
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'agenda', agendaUid: typeIdentifier, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 183
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
                      lineNumber: 190
                    }
                  },
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'user', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 191
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
                        lineNumber: 193
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
                      lineNumber: 204
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
                      lineNumber: 207
                    }
                  },
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'user', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 208
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
                      lineNumber: 216
                    }
                  },
                  getLabel('youWantToContributeToTheAgenda'),
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
              } else {
                return _react3.default.createElement(
                  _react2.Fragment,
                  {
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 225
                    }
                  },
                  _react3.default.createElement(
                    EntityComponent,
                    { type: 'user', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 226
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
                        lineNumber: 228
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
//# sourceMappingURL=ConversationTitle.js.map