'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _partition4 = require('lodash/partition');

var _partition5 = _interopRequireDefault(_partition4);

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
    _class,
    _jsxFileName = 'src/containers/Inbox/Inbox.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxConnect = require('redux-connect');

var _recompose = require('recompose');

var _reactWaypoint = require('react-waypoint');

var _reactWaypoint2 = _interopRequireDefault(_reactWaypoint);

var _Spinner = require('@openagenda/react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _nl2br = require('@openagenda/react-utils/dist/nl2br');

var _nl2br2 = _interopRequireDefault(_nl2br);

var _components2 = require('../../components');

var _inbox = require('../../redux/modules/inbox');

var inboxActions = _interopRequireWildcard(_inbox);

var _conversation = require('../../redux/modules/conversation');

var conversationActions = _interopRequireWildcard(_conversation);

var _conversationForm = require('../../redux/modules/conversationForm');

var conversationFormActions = _interopRequireWildcard(_conversationForm);

var _modals = require('../../redux/modules/modals');

var modalActions = _interopRequireWildcard(_modals);

var _removeTrailingSlash = require('../../utils/removeTrailingSlash');

var _removeTrailingSlash2 = _interopRequireDefault(_removeTrailingSlash);

var _setFlashMessage = require('../../utils/setFlashMessage');

var _setFlashMessage2 = _interopRequireDefault(_setFlashMessage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Inbox: {
    displayName: 'Inbox'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/containers/Inbox/Inbox.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var Inbox = _wrapComponent('Inbox')((_dec = (0, _reduxConnect.asyncConnect)([{
  key: 'inbox', // key is usefull for the redirection
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState,
        redirect = _ref.helpers.redirect;

    var state = getState();
    var location = state.routing.locationBeforeTransitions;

    var _state$settings = state.settings,
        prefix = _state$settings.prefix,
        focusFistConversation = _state$settings.focusFistConversation,
        hideEmptyList = _state$settings.hideEmptyList,
        topListForm = _state$settings.topListForm;

    var query = focusFistConversation ? { limit: 1 } : {};

    return dispatch(inboxActions.load(query)).then(function () {
      var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(result) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(topListForm && !conversationActions.isAuthorLoaded(state))) {
                  _context.next = 3;
                  break;
                }

                _context.next = 3;
                return (0, _bluebird.resolve)(dispatch(conversationActions.loadAuthor()));

              case 3:
                if (!(location.state && location.state.showListAllowed)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt('return');

              case 5:
                if (!(hideEmptyList && result.conversations && !result.conversations.length)) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt('return', redirect((0, _removeTrailingSlash2.default)(prefix) + '/conversation/create'));

              case 7:
                if (!focusFistConversation) {
                  _context.next = 14;
                  break;
                }

                if (!(result.conversations && !result.conversations.length)) {
                  _context.next = 12;
                  break;
                }

                return _context.abrupt('return', redirect((0, _removeTrailingSlash2.default)(prefix) + '/conversation/create'));

              case 12:
                if (!(result.conversations && result.conversations.length && !result.conversations[0].resolvedAt)) {
                  _context.next = 14;
                  break;
                }

                return _context.abrupt('return', redirect((0, _removeTrailingSlash2.default)(prefix) + '/conversation/' + result.conversations[0].id));

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  }
}]), _dec2 = (0, _reactRedux.connect)(function (state) {
  return {
    initialValues: state.settings.defaultQuery,
    settings: state.settings,
    user: state.user,
    conversations: state.inbox.data,
    loading: state.inbox.loading,
    nextLoading: state.inbox.nextLoading,
    lastPage: state.inbox.lastPage,
    author: state.conversation.author
  };
}, (0, _extends3.default)({}, conversationActions, inboxActions, conversationFormActions, modalActions)), _dec3 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = _dec3(_class = function (_Component) {
  (0, _inherits3.default)(Inbox, _Component);

  function Inbox(props) {
    (0, _classCallCheck3.default)(this, Inbox);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Inbox.__proto__ || (0, _getPrototypeOf2.default)(Inbox)).call(this, props));

    _this.nextPage = function () {
      var _this$props = _this.props,
          lastPage = _this$props.lastPage,
          loading = _this$props.loading,
          nextLoading = _this$props.nextLoading,
          conversations = _this$props.conversations;


      if (!conversations || !conversations.length || loading || nextLoading || lastPage) {
        return;
      }

      _this.props.nextPage();
    };

    _this.throttledNextPage = (0, _throttle3.default)(_this.nextPage, 400, { trailing: false });

    _this.FromWrapper = _this.FromWrapper.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Inbox, [{
    key: 'FromWrapper',
    value: function FromWrapper(_ref3) {
      var handleSubmit = _ref3.handleSubmit,
          children = _ref3.children;
      var _props = this.props,
          getLabel = _props.getLabel,
          settings = _props.settings,
          author = _props.author;
      var belowMessageDesc = settings.belowMessageDesc;


      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit, className: 'conversation-form margin-bottom-md', __source: {
            fileName: _jsxFileName,
            lineNumber: 80
          }
        },
        children,
        author.inbox && author.inbox.type !== 'user' && author.inboxUser ? _react3.default.createElement(
          'div',
          { className: 'margin-bottom-sm', __source: {
              fileName: _jsxFileName,
              lineNumber: 84
            }
          },
          getLabel('yourMessageWillBeSigned'),
          ' ',
          _react3.default.createElement(
            'b',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 85
              }
            },
            author.inbox.name
          )
        ) : null,
        belowMessageDesc ? _react3.default.createElement('div', { className: 'margin-bottom-xs', dangerouslySetInnerHTML: { __html: belowMessageDesc }, __source: {
            fileName: _jsxFileName,
            lineNumber: 90
          }
        }) : null,
        _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn btn-primary margin-top-xs', __source: {
              fileName: _jsxFileName,
              lineNumber: 93
            }
          },
          getLabel('send')
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          conversations = _props2.conversations,
          nextLoading = _props2.nextLoading,
          router = _props2.router,
          getLabel = _props2.getLabel,
          showModal = _props2.showModal,
          createConversation = _props2.createConversation,
          author = _props2.author,
          initialValues = _props2.initialValues,
          settings = _props2.settings,
          user = _props2.user;
      var ContentWrapper = settings.ContentWrapper,
          allowCreateConversation = settings.allowCreateConversation,
          topListForm = settings.topListForm,
          prefix = settings.prefix,
          emptyInboxLabel = settings.emptyInboxLabel,
          creationSubtitle = settings.creationSubtitle,
          creationButtonLabel = settings.creationButtonLabel,
          maskCreationSubtitle = settings.maskCreationSubtitle,
          creationDesc = settings.creationDesc,
          onConversationCreateRedirect = settings.onConversationCreateRedirect,
          onConversationCreateFlash = settings.onConversationCreateFlash;

      var _partition2 = (0, _partition5.default)(conversations, function (o) {
        return !o.resolvedAt;
      }),
          _partition3 = (0, _slicedToArray3.default)(_partition2, 2),
          unresolvedConvs = _partition3[0],
          resolvedConvs = _partition3[1];

      var content = _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 130
          }
        },
        allowCreateConversation && !topListForm && _react3.default.createElement(
          'div',
          { className: 'text-right', __source: {
              fileName: _jsxFileName,
              lineNumber: 131
            }
          },
          _react3.default.createElement(
            _components2.LinkContainer,
            { to: '/conversation/create', __source: {
                fileName: _jsxFileName,
                lineNumber: 132
              }
            },
            function (path) {
              return _react3.default.createElement(
                'button',
                {
                  className: 'btn btn-info btn-creation pull-right',
                  onClick: function onClick() {
                    return router.push(path);
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 134
                  }
                },
                creationButtonLabel ? creationButtonLabel : getLabel('createConversation')
              );
            }
          )
        ),
        _react3.default.createElement(
          'div',
          { className: 'inbox-head', __source: {
              fileName: _jsxFileName,
              lineNumber: 144
            }
          },
          topListForm && !unresolvedConvs.length && !maskCreationSubtitle ? _react3.default.createElement(_components2.Breadcrumb, {
            breadParts: [{
              component: creationSubtitle ? creationSubtitle : getLabel('newConversation')
            }],
            disableFirstPartLink: true,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 147
            }
          }) : _react3.default.createElement(_components2.Breadcrumb, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 153
            }
          })
        ),
        topListForm && !unresolvedConvs.length ? _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 156
            }
          },
          creationDesc ? _react3.default.createElement(
            'p',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 157
              }
            },
            creationDesc
          ) : null,
          _react3.default.createElement(
            'div',
            { className: 'media', __source: {
                fileName: _jsxFileName,
                lineNumber: 159
              }
            },
            _react3.default.createElement(
              'div',
              { className: 'media-left', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 160
                }
              },
              _react3.default.createElement(_components2.AuthorAvatar, { author: author, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 161
                }
              })
            ),
            _react3.default.createElement(
              'div',
              { className: 'media-body', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 163
                }
              },
              _react3.default.createElement(
                'h4',
                { className: 'media-heading margin-bottom-sm', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 164
                  }
                },
                getAuthorName(author)
              ),
              _react3.default.createElement(_components2.ConversationForm, {
                form: 'inbox-conversation-create',
                onSubmit: function onSubmit(data) {
                  return createConversation(data).then(function () {
                    var _ref4 = (0, _bluebird.method)(function (result) {
                      if (onConversationCreateRedirect) {
                        if (onConversationCreateFlash) {
                          (0, _setFlashMessage2.default)(onConversationCreateFlash);
                        }

                        window.location.href = onConversationCreateRedirect;
                      } else {
                        var url = (0, _removeTrailingSlash2.default)(prefix) + ('/conversation/' + result.conversation.id);
                        router.push(url);

                        if (onConversationCreateFlash) {
                          showModal('messageSent', { message: onConversationCreateFlash });
                        } else {
                          showModal('messageSent');
                        }
                      }

                      return result;
                    });

                    return function (_x2) {
                      return _ref4.apply(this, arguments);
                    };
                  }());
                },
                initialValues: initialValues,
                Wrapper: this.FromWrapper,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 166
                }
              })
            )
          )
        ) : null,
        conversations && conversations.length ? _react3.default.createElement(
          'h4',
          { className: 'margin-bottom-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 197
            }
          },
          getLabel(!unresolvedConvs.length ? 'pastConversations' : 'ongoingConversations')
        ) : null,
        !unresolvedConvs.length ? _react3.default.createElement(_components2.ConversationList, { conversations: resolvedConvs, user: user, __source: {
            fileName: _jsxFileName,
            lineNumber: 202
          }
        }) : _react3.default.createElement(_components2.ConversationList, { conversations: unresolvedConvs, user: user, __source: {
            fileName: _jsxFileName,
            lineNumber: 203
          }
        }),
        unresolvedConvs.length && resolvedConvs.length ? _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 205
            }
          },
          _react3.default.createElement(
            'h4',
            { className: 'margin-bottom-md', __source: {
                fileName: _jsxFileName,
                lineNumber: 206
              }
            },
            getLabel('pastConversations')
          ),
          _react3.default.createElement(_components2.ConversationList, { conversations: resolvedConvs, user: user, __source: {
              fileName: _jsxFileName,
              lineNumber: 210
            }
          })
        ) : null,
        !conversations || !conversations.length ? _react3.default.createElement(
          'div',
          { className: 'padding-v-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 216
            }
          },
          (0, _nl2br2.default)(emptyInboxLabel ? emptyInboxLabel : getLabel('noResult'))
        ) : null,
        nextLoading && _react3.default.createElement(
          'div',
          { className: 'padding-v-md', style: { position: 'relative' }, __source: {
              fileName: _jsxFileName,
              lineNumber: 221
            }
          },
          _react3.default.createElement(_Spinner2.default, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 222
            }
          })
        ),
        _react3.default.createElement(_reactWaypoint2.default, { onEnter: this.throttledNextPage, __source: {
            fileName: _jsxFileName,
            lineNumber: 225
          }
        })
      );

      return ContentWrapper ? _react3.default.createElement(
        ContentWrapper,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 230
          }
        },
        content
      ) : content;
    }
  }]);
  return Inbox;
}(_react2.Component)) || _class) || _class) || _class));

exports.default = Inbox;
;

function getAuthorName(obj) {
  if (obj.inboxUser) {
    return obj.inboxUser.name;
  }

  return obj.inbox.name;
}
module.exports = exports['default'];
//# sourceMappingURL=Inbox.js.map