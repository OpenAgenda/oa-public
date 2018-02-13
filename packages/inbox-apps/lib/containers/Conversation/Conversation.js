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
    user: state.user,
    author: state.conversation.author,
    conversations: state.inbox.data,
    conversation: state.conversation.data,
    messages: state.conversation.messages,
    loading: state.conversation.loading,
    nextLoading: state.conversation.nextLoading,
    lastPage: state.conversation.lastPage,
    res: state.res
  };
}, (0, _extends3.default)({}, conversationActions, modalActions, { resetForm: _reduxForm.reset, inboxLoad: inboxActions.load })), _dec4 = (0, _recompose.getContext)({
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
        var _this$props2, router, sendMessage, resetForm, showModal, getLabel;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$props2 = _this.props, router = _this$props2.router, sendMessage = _this$props2.sendMessage, resetForm = _this$props2.resetForm, showModal = _this$props2.showModal, getLabel = _this$props2.getLabel;
                _context.next = 3;
                return (0, _bluebird.resolve)(sendMessage(router.params.conversationId, data).catch(function () {
                  throw new _reduxForm.SubmissionError({ _error: getLabel('sendMessageError') });
                }));

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

    _this.FromWrapper = _this.FromWrapper.bind(_this);
    _this.getClosedLabel = _this.getClosedLabel.bind(_this);
    _this.TitleEntityComponent = _this.TitleEntityComponent.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Conversation, [{
    key: 'FromWrapper',
    value: function FromWrapper(_ref4) {
      var children = _ref4.children,
          handleSubmit = _ref4.handleSubmit,
          submitting = _ref4.submitting,
          error = _ref4.error;
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
            lineNumber: 118
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'media-left media-top', __source: {
              fileName: _jsxFileName,
              lineNumber: 119
            }
          },
          _react3.default.createElement(_components2.AuthorAvatar, { author: author, __source: {
              fileName: _jsxFileName,
              lineNumber: 120
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'media-body', __source: {
              fileName: _jsxFileName,
              lineNumber: 123
            }
          },
          _react3.default.createElement(
            'p',
            { className: 'author-name', __source: {
                fileName: _jsxFileName,
                lineNumber: 124
              }
            },
            getAuthorName(author)
          ),
          _react3.default.createElement(
            'form',
            { onSubmit: handleSubmit, className: 'message-form margin-bottom-md', __source: {
                fileName: _jsxFileName,
                lineNumber: 126
              }
            },
            children,
            error ? _react3.default.createElement(
              'p',
              { className: 'text-danger', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 129
                }
              },
              error
            ) : null,
            author.inbox && author.inbox.type !== 'user' && author.inboxUser ? _react3.default.createElement(
              'div',
              { className: 'margin-bottom-sm', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 132
                }
              },
              getLabel('yourMessageWillBeSigned'),
              ' ',
              _react3.default.createElement(
                'b',
                {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 133
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
                  lineNumber: 137
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


      switch (conversation.type) {
        case 'request_contribute':
          switch (conversation.store.resolvedWith) {
            case 'accept':
              return getLabel('requestContributeAccepted');
            case 'refuse':
              return getLabel('requestContributeRefused');
          }
        case 'edition_request':
          switch (conversation.store.resolvedWith) {
            case 'accept':
              return getLabel('editionRequestAccepted');
            case 'refuse':
              return getLabel('editionRequestRefused');
          }
      }

      return getLabel('conversationAreResolved');
    }
  }, {
    key: 'TitleEntityComponent',
    value: function TitleEntityComponent(_ref5) {
      var children = _ref5.children,
          type = _ref5.type,
          agendaUid = _ref5.agendaUid,
          eventUid = _ref5.eventUid,
          locationUid = _ref5.locationUid;
      var context = this.props.settings.context;


      switch (type) {
        case 'agenda':
          return _react3.default.createElement(
            _components2.Link,
            {
              to: '/agendas/' + agendaUid,
              className: 'conversation-title-entity',
              external: true,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 179
              }
            },
            children
          );
        case 'event':
          return _react3.default.createElement(
            _components2.Link,
            {
              to: '/agendas/' + agendaUid + '/events/' + eventUid,
              className: 'conversation-title-entity',
              external: true,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 189
              }
            },
            children
          );
        case 'location':
          if (context === 'agenda') {
            return _react3.default.createElement(
              _components2.Link,
              {
                to: '/agendas/' + agendaUid + '/admin/locations?uids[]=' + locationUid,
                className: 'conversation-title-entity',
                external: true,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 200
                }
              },
              children
            );
          } else {
            return _react3.default.createElement(
              'b',
              { className: 'conversation-title-entity', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 209
                }
              },
              children
            );
          }
        default:
          return _react3.default.createElement(
            'span',
            { className: 'conversation-title-entity', __source: {
                fileName: _jsxFileName,
                lineNumber: 212
              }
            },
            children
          );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          conversations = _props3.conversations,
          conversation = _props3.conversation,
          messages = _props3.messages,
          user = _props3.user,
          inboxLoad = _props3.inboxLoad,
          triggerAction = _props3.triggerAction,
          showModal = _props3.showModal,
          nextLoading = _props3.nextLoading,
          resume = _props3.resume,
          getLabel = _props3.getLabel,
          settings = _props3.settings;
      var ContentWrapper = settings.ContentWrapper,
          focusFistConversation = settings.focusFistConversation;


      var content = _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 226
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'inbox-head', __source: {
              fileName: _jsxFileName,
              lineNumber: 227
            }
          },
          _react3.default.createElement(_components2.Breadcrumb, {
            breadParts: [{
              component: _react3.default.createElement(_components2.ConversationTitle, {
                user: user,
                conversation: conversation,
                EntityComponent: this.TitleEntityComponent,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 230
                }
              }),
              className: 'text-muted'
            }],
            disableFirstPartLink: !(0, _showBackLink2.default)(settings, conversations),
            __source: {
              fileName: _jsxFileName,
              lineNumber: 228
            }
          }),
          conversation.actions && conversation.actions.length ? _react3.default.createElement(
            'div',
            { className: 'inbox-actions margin-top-lg', __source: {
                fileName: _jsxFileName,
                lineNumber: 241
              }
            },
            _react3.default.createElement(_components2.ActionsList, {
              onAction: function onAction(code) {
                return triggerAction(conversation.id, code).then(function () {
                  return inboxLoad(focusFistConversation ? { limit: 1 } : {});
                });
              },
              actions: conversation.actions,
              showModal: showModal,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 242
              }
            })
          ) : null,
          conversation.closedAt && _react3.default.createElement(
            'div',
            { className: 'conversation-resolved well text-center margin-top-lg', __source: {
                fileName: _jsxFileName,
                lineNumber: 254
              }
            },
            _react3.default.createElement('i', { className: 'fa fa-lock text-muted', 'aria-hidden': 'true', __source: {
                fileName: _jsxFileName,
                lineNumber: 255
              }
            }),
            ' ',
            this.getClosedLabel(),
            _react3.default.createElement('br', {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 256
              }
            }),
            _react3.default.createElement(
              'button',
              { className: 'btn btn-link btn-resume', onClick: function onClick() {
                  return resume(conversation.id);
                }, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 257
                }
              },
              getLabel('resumeConversation')
            )
          )
        ),
        conversation && !conversation.closedAt && _react3.default.createElement(_components2.MessageForm, {
          form: 'message',
          onSubmit: this.sendMessage,
          Wrapper: this.FromWrapper,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 265
          }
        }),
        messages && messages.length ? _react3.default.createElement(_components2.MessageList, { messages: messages, __source: {
            fileName: _jsxFileName,
            lineNumber: 272
          }
        }) : null,
        !messages || !messages.length ? _react3.default.createElement(
          'div',
          { className: 'text-center text-muted margin-v-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 274
            }
          },
          getLabel('noResult')
        ) : null,
        nextLoading && _react3.default.createElement(
          'div',
          { className: 'padding-v-md', style: { position: 'relative' }, __source: {
              fileName: _jsxFileName,
              lineNumber: 278
            }
          },
          _react3.default.createElement(_Spinner2.default, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 279
            }
          })
        ),
        _react3.default.createElement(_reactWaypoint2.default, { onEnter: this.throttledNextPage, __source: {
            fileName: _jsxFileName,
            lineNumber: 282
          }
        })
      );

      return ContentWrapper ? _react3.default.createElement(
        ContentWrapper,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 287
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
module.exports = exports['default'];
//# sourceMappingURL=Conversation.js.map