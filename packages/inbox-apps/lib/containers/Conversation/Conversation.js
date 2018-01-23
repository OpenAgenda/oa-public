'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _bluebird = require('bluebird');

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

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _upperFirst2 = require('lodash/upperFirst');

var _upperFirst3 = _interopRequireDefault(_upperFirst2);

var _find2 = require('lodash/find');

var _find3 = _interopRequireDefault(_find2);

var _throttle2 = require('lodash/throttle');

var _throttle3 = _interopRequireDefault(_throttle2);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec,
    _dec2,
    _dec3,
    _dec4,
    _class,
    _jsxFileName = 'src/containers/Conversation/Conversation.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxConnect = require('redux-connect');

var _reduxForm = require('redux-form');

var _reactWaypoint = require('react-waypoint');

var _reactWaypoint2 = _interopRequireDefault(_reactWaypoint);

var _recompose = require('recompose');

var _Spinner = require('@openagenda/react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _components2 = require('../../components');

var _conversation = require('../../redux/modules/conversation');

var conversationActions = _interopRequireWildcard(_conversation);

var _inbox = require('../../redux/modules/inbox');

var inboxActions = _interopRequireWildcard(_inbox);

var _modals = require('../../redux/modules/modals');

var modalActions = _interopRequireWildcard(_modals);

var _showBackLink = require('../../utils/showBackLink');

var _showBackLink2 = _interopRequireDefault(_showBackLink);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Conversation: {
    displayName: 'Conversation'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/containers/Conversation/Conversation.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var Conversation = _wrapComponent('Conversation')((_dec = (0, _reduxConnect.asyncConnect)([{
  key: 'asyncConnectConversation',
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState,
        router = _ref.router,
        redirect = _ref.helpers.redirect;

    var state = getState();
    var promises = [];

    var _state$settings = state.settings,
        prefix = _state$settings.prefix,
        focusFistConversation = _state$settings.focusFistConversation;

    var query = focusFistConversation ? { limit: 1 } : {};

    // if ( !inboxActions.isLoaded( state ) ) {
    promises.push(dispatch(inboxActions.load(query)));
    // }

    if (!conversationActions.isAuthorLoaded(state)) {
      promises.push(dispatch(conversationActions.loadAuthor()));
    }

    // if ( !conversationActions.isLoaded( state ) ) {
    promises.push(dispatch(conversationActions.load(router.params.conversationId)).catch(function () {
      return redirect(prefix);
    }));
    // }

    return (0, _bluebird.all)(promises);
  }
}]), _dec2 = (0, _reduxConnect.asyncConnect)([{
  promise: function promise(_ref2) {
    var _ref2$store = _ref2.store,
        dispatch = _ref2$store.dispatch,
        getState = _ref2$store.getState;

    var state = getState();

    if (!conversationActions.isAuthorLoaded(state)) {
      return dispatch(conversationActions.loadAuthor());
    }
  }
}]), _dec3 = (0, _reactRedux.connect)(function (state) {
  return {
    settings: state.settings,
    author: state.conversation.author,
    conversations: state.inbox.data,
    conversation: state.conversation.data,
    messages: state.conversation.messages,
    loading: state.conversation.loading,
    nextLoading: state.conversation.nextLoading,
    lastPage: state.conversation.lastPage,
    res: state.res
  };
}, (0, _extends3.default)({}, conversationActions, modalActions, { resetForm: _reduxForm.reset })), _dec4 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = function (_Component) {
  (0, _inherits3.default)(Conversation, _Component);

  function Conversation(props) {
    var _this2 = this;

    (0, _classCallCheck3.default)(this, Conversation);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Conversation.__proto__ || (0, _getPrototypeOf2.default)(Conversation)).call(this, props));

    _this.nextPage = function () {
      var _this$props = _this.props,
          lastPage = _this$props.lastPage,
          loading = _this$props.loading,
          nextLoading = _this$props.nextLoading,
          messages = _this$props.messages,
          router = _this$props.router;


      if (!messages || !messages.length || loading || nextLoading || lastPage) {
        return;
      }

      _this.props.nextPage(router.params.conversationId);
    };

    _this.sendMessage = function () {
      var _ref3 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
        var _this$props2, router, sendMessage, resetForm, showModal;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$props2 = _this.props, router = _this$props2.router, sendMessage = _this$props2.sendMessage, resetForm = _this$props2.resetForm, showModal = _this$props2.showModal;
                _context.next = 3;
                return (0, _bluebird.resolve)(sendMessage(router.params.conversationId, data));

              case 3:

                resetForm('message');
                showModal('messageSent');

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      }));

      return function (_x) {
        return _ref3.apply(this, arguments);
      };
    }();

    _this.throttledNextPage = (0, _throttle3.default)(_this.nextPage, 400, { trailing: false });

    _this.renderForm = _this.renderForm.bind(_this);
    _this.renderTitle = _this.renderTitle.bind(_this);
    _this.FromWrapper = _this.FromWrapper.bind(_this);
    _this.getClosedLabel = _this.getClosedLabel.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Conversation, [{
    key: 'FromWrapper',
    value: function FromWrapper(_ref4) {
      var children = _ref4.children,
          handleSubmit = _ref4.handleSubmit,
          submitting = _ref4.submitting;
      var _props = this.props,
          getLabel = _props.getLabel,
          author = _props.author,
          messages = _props.messages,
          conversation = _props.conversation;


      var contextInbox = (0, _find3.default)(conversation.inboxes, ['id', conversation.inboxContextId]);

      if (contextInbox) {
        author.inbox = contextInbox;
      }

      return _react3.default.createElement(
        'div',
        { className: 'media', __source: {
            fileName: _jsxFileName,
            lineNumber: 112
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'media-left media-top', __source: {
              fileName: _jsxFileName,
              lineNumber: 113
            }
          },
          _react3.default.createElement(_components2.AuthorAvatar, { author: author, __source: {
              fileName: _jsxFileName,
              lineNumber: 114
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'media-body', __source: {
              fileName: _jsxFileName,
              lineNumber: 117
            }
          },
          _react3.default.createElement(
            'p',
            { className: 'author-name', __source: {
                fileName: _jsxFileName,
                lineNumber: 118
              }
            },
            getAuthorName(author)
          ),
          _react3.default.createElement(
            'form',
            { onSubmit: handleSubmit, className: 'message-form margin-bottom-md', __source: {
                fileName: _jsxFileName,
                lineNumber: 120
              }
            },
            children,
            author.inbox && author.inbox.type !== 'user' && author.inboxUser ? _react3.default.createElement(
              'div',
              { className: 'margin-bottom-sm', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 124
                }
              },
              getLabel('yourMessageWillBeSigned'),
              ' ',
              _react3.default.createElement(
                'b',
                {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 125
                  }
                },
                author.inbox.name
              )
            ) : null,
            _react3.default.createElement(
              'button',
              {
                type: 'submit',
                disabled: submitting,
                className: 'btn btn-primary margin-top-xs',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 129
                }
              },
              getLabel(messages && messages.length ? 'reply' : 'submit')
            )
          )
        )
      );
    }
  }, {
    key: 'getClosedLabel',
    value: function getClosedLabel() {
      var _props2 = this.props,
          conversation = _props2.conversation,
          getLabel = _props2.getLabel;


      if (conversation.type === 'request_contribute') {
        switch (conversation.store.resolvedWith) {
          case 'accept':
            return getLabel('requestContributeAccepted');
          case 'refuse':
            return getLabel('requestContributeRefused');
        }
      }

      return getLabel('conversationAreResolved');
    }
  }, {
    key: 'renderForm',
    value: function renderForm() {
      var _props3 = this.props,
          conversation = _props3.conversation,
          triggerAction = _props3.triggerAction,
          resume = _props3.resume,
          getLabel = _props3.getLabel,
          showModal = _props3.showModal;


      if (!conversation) {
        return null;
      }

      if (conversation.closedAt) {
        return _react3.default.createElement(
          'div',
          { className: 'conversation-resolved well text-center margin-top-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 166
            }
          },
          _react3.default.createElement('i', { className: 'fa fa-lock text-muted', 'aria-hidden': 'true', __source: {
              fileName: _jsxFileName,
              lineNumber: 167
            }
          }),
          ' ',
          this.getClosedLabel(),
          _react3.default.createElement('br', {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 168
            }
          }),
          _react3.default.createElement(
            'button',
            { className: 'btn btn-link btn-resume', onClick: function onClick() {
                return resume(conversation.id);
              }, __source: {
                fileName: _jsxFileName,
                lineNumber: 169
              }
            },
            getLabel('resumeConversation')
          )
        );
      }

      if (!conversation.actions || !conversation.actions.length) {
        return _react3.default.createElement(_components2.MessageForm, {
          form: 'message',
          onSubmit: this.sendMessage,
          Wrapper: this.FromWrapper,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 178
          }
        });
      }

      return _react3.default.createElement(
        'div',
        { className: 'row', __source: {
            fileName: _jsxFileName,
            lineNumber: 187
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'col-sm-10', __source: {
              fileName: _jsxFileName,
              lineNumber: 188
            }
          },
          _react3.default.createElement(_components2.MessageForm, {
            form: 'message',
            onSubmit: this.sendMessage,
            Wrapper: this.FromWrapper,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 189
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'col-sm-2', __source: {
              fileName: _jsxFileName,
              lineNumber: 195
            }
          },
          _react3.default.createElement(
            'p',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 196
              }
            },
            _react3.default.createElement(
              'b',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 196
                }
              },
              getLabel('actions')
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'text-center', __source: {
                fileName: _jsxFileName,
                lineNumber: 198
              }
            },
            _react3.default.createElement(_components2.ActionsList, {
              onAction: triggerAction.bind(null, conversation.id),
              actions: conversation.actions,
              showModal: showModal,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 199
              }
            })
          )
        )
      );
    }
  }, {
    key: 'renderTitle',
    value: function renderTitle() {
      var _props4 = this.props,
          settings = _props4.settings,
          conversation = _props4.conversation,
          getLabel = _props4.getLabel;
      var maskEventTitle = settings.maskEventTitle;
      var type = conversation.type,
          store = conversation.store,
          typeIdentifier = conversation.typeIdentifier;


      if (!maskEventTitle && store && store.params && store.params.eventTitle) {
        return _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 218
            }
          },
          ' ',
          _react3.default.createElement(
            'h4',
            { className: 'inbox-title', __source: {
                fileName: _jsxFileName,
                lineNumber: 220
              }
            },
            _react3.default.createElement(
              'span',
              { className: 'text-muted', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 221
                }
              },
              (0, _upperFirst3.default)(getLabel('conversationInitiatedOn'))
            ),
            ' ',
            _react3.default.createElement(
              _components2.Link,
              { to: '/agendas/' + store.params.agendaUid + '/events/' + typeIdentifier, external: true, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 222
                }
              },
              store.params.eventTitle
            )
          ),
          _react3.default.createElement(
            'p',
            { className: 'margin-bottom-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 226
              }
            },
            getLabel('by'),
            ' ',
            _react3.default.createElement(
              'b',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 226
                }
              },
              getCreatorName(conversation)
            )
          )
        );
      }

      if (type === 'contact_form') {
        return _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 233
            }
          },
          ' ',
          _react3.default.createElement(
            'h4',
            { className: 'inbox-title', __source: {
                fileName: _jsxFileName,
                lineNumber: 235
              }
            },
            _react3.default.createElement(
              'span',
              { className: 'text-muted', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 236
                }
              },
              (0, _upperFirst3.default)(getLabel('contactConversationInitiated'))
            )
          ),
          _react3.default.createElement(
            'p',
            { className: 'margin-bottom-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 238
              }
            },
            getLabel('by'),
            ' ',
            _react3.default.createElement(
              'b',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 238
                }
              },
              getCreatorName(conversation)
            )
          )
        );
      }

      if (type === 'request_contribute') {
        var contextInbox = getContextInbox(conversation);

        if (contextInbox.type === 'agenda') {
          return _react3.default.createElement(
            'h4',
            { className: 'inbox-title text-muted margin-bottom-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 248
              }
            },
            _react3.default.createElement(
              'b',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 249
                }
              },
              getCreatorName(conversation)
            ),
            ' ',
            getLabel('wouldLikeToContribute')
          );
        }

        return _react3.default.createElement(
          'h4',
          { className: 'inbox-title text-muted margin-bottom-sm', __source: {
              fileName: _jsxFileName,
              lineNumber: 255
            }
          },
          getLabel('requestForContribution'),
          ' ',
          _react3.default.createElement(
            'b',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 256
              }
            },
            store.params.agendaTitle
          )
        );
      }

      return _react3.default.createElement(
        'h4',
        { className: 'inbox-title text-muted margin-bottom-sm', __source: {
            fileName: _jsxFileName,
            lineNumber: 262
          }
        },
        getLabel('conversationInitiatedBy'),
        ' ',
        _react3.default.createElement(
          'b',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 263
            }
          },
          getCreatorName(conversation)
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props5 = this.props,
          conversations = _props5.conversations,
          messages = _props5.messages,
          nextLoading = _props5.nextLoading,
          getLabel = _props5.getLabel,
          settings = _props5.settings,
          router = _props5.router;
      var ContentWrapper = settings.ContentWrapper;


      var content = _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 277
          }
        },
        (0, _showBackLink2.default)(settings, conversations) ? _react3.default.createElement(
          'div',
          { className: 'text-right margin-bottom-sm', __source: {
              fileName: _jsxFileName,
              lineNumber: 282
            }
          },
          _react3.default.createElement(
            _components2.LinkContainer,
            { to: '/', __source: {
                fileName: _jsxFileName,
                lineNumber: 283
              }
            },
            function (path) {
              return _react3.default.createElement(
                'button',
                {
                  className: 'btn btn-info btn-back',
                  onClick: function onClick() {
                    return router.push({ pathname: path, state: { showListAllowed: true } });
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 285
                  }
                },
                getLabel('showAllConversations')
              );
            }
          )
        ) : null,
        this.renderTitle(),
        this.renderForm(),
        messages && messages.length ? _react3.default.createElement(_components2.MessageList, { messages: messages, __source: {
            fileName: _jsxFileName,
            lineNumber: 299
          }
        }) : null,
        !messages || !messages.length ? _react3.default.createElement(
          'div',
          { className: 'text-center text-muted margin-v-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 301
            }
          },
          getLabel('noResult')
        ) : null,
        nextLoading && _react3.default.createElement(
          'div',
          { className: 'padding-v-md', style: { position: 'relative' }, __source: {
              fileName: _jsxFileName,
              lineNumber: 305
            }
          },
          _react3.default.createElement(_Spinner2.default, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 306
            }
          })
        ),
        _react3.default.createElement(_reactWaypoint2.default, { onEnter: this.throttledNextPage, __source: {
            fileName: _jsxFileName,
            lineNumber: 309
          }
        })
      );

      return ContentWrapper ? _react3.default.createElement(
        ContentWrapper,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 314
          }
        },
        content
      ) : content;
    }
  }]);
  return Conversation;
}(_react2.Component)) || _class) || _class) || _class) || _class));

exports.default = Conversation;


function getAuthorName(author) {
  if (author.inboxUser) {
    return author.inboxUser.name;
  }

  return author.inbox.name;
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
//# sourceMappingURL=Conversation.js.map