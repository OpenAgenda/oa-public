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

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _bluebird = require('bluebird');

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

var _reactRouterRedux = require('react-router-redux');

var _recompose = require('recompose');

var _reactWaypoint = require('react-waypoint');

var _reactWaypoint2 = _interopRequireDefault(_reactWaypoint);

var _Spinner = require('@openagenda/react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _components2 = require('../../components');

var _inbox = require('../../redux/modules/inbox');

var inboxActions = _interopRequireWildcard(_inbox);

var _conversation = require('../../redux/modules/conversation');

var conversationActions = _interopRequireWildcard(_conversation);

var _conversationForm = require('../../redux/modules/conversationForm');

var conversationFormActions = _interopRequireWildcard(_conversationForm);

var _removeTrailingSlash = require('../../utils/removeTrailingSlash');

var _removeTrailingSlash2 = _interopRequireDefault(_removeTrailingSlash);

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

    var _state$settings = state.settings,
        prefix = _state$settings.prefix,
        focusFistConversation = _state$settings.focusFistConversation,
        hideEmptyList = _state$settings.hideEmptyList,
        topListConversation = _state$settings.topListConversation;

    var query = focusFistConversation ? { limit: 1 } : {};

    return dispatch(inboxActions.load(query)).then(function () {
      var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(result) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(topListConversation && !conversationActions.isAuthorLoaded(state))) {
                  _context.next = 3;
                  break;
                }

                _context.next = 3;
                return (0, _bluebird.resolve)(dispatch(conversationActions.loadAuthor()));

              case 3:
                if (!(hideEmptyList && result.conversations && !result.conversations.length)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt('return', redirect((0, _removeTrailingSlash2.default)(prefix) + '/conversation/create'));

              case 5:
                if (!focusFistConversation) {
                  _context.next = 12;
                  break;
                }

                if (!(result.conversations && !result.conversations.length)) {
                  _context.next = 10;
                  break;
                }

                return _context.abrupt('return', redirect((0, _removeTrailingSlash2.default)(prefix) + '/conversation/create'));

              case 10:
                if (result.conversations[0].resolvedAt) {
                  _context.next = 12;
                  break;
                }

                return _context.abrupt('return', redirect((0, _removeTrailingSlash2.default)(prefix) + '/conversation/' + result.conversations[0].id));

              case 12:
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

    // const result = await dispatch( inboxActions.load( query ) );
    //
    // if ( topListConversation && !conversationActions.isAuthorLoaded( state ) ) {
    //   await dispatch( conversationActions.loadAuthor() );
    // }
    //
    // if ( (hideEmptyList) && result.conversations && !result.conversations.length ) {
    //   return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
    // }
    //
    // if ( focusFistConversation ) {
    //   if ( result.conversations && !result.conversations.length ) {
    //     return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
    //   } else if ( !result.conversations[ 0 ].resolvedAt ) {
    //     return redirect( `${removeTrailingSlash( prefix )}/conversation/${result.conversations[ 0 ].id}` );
    //   }
    // }
  }
}]), _dec2 = (0, _reactRedux.connect)(function (state) {
  return {
    initialValues: state.settings.defaultQuery,
    settings: state.settings,
    conversations: state.inbox.data,
    loading: state.inbox.loading,
    nextLoading: state.inbox.nextLoading,
    lastPage: state.inbox.lastPage,
    author: state.conversation.author
  };
}, (0, _extends3.default)({}, inboxActions, conversationFormActions, { push: _reactRouterRedux.push })), _dec3 = (0, _recompose.getContext)({
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
      var getLabel = this.props.getLabel;


      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit, className: 'conversation-form', __source: {
            fileName: _jsxFileName,
            lineNumber: 89
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'margin-bottom-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 90
            }
          },
          children
        ),
        _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn btn-primary', __source: {
              fileName: _jsxFileName,
              lineNumber: 94
            }
          },
          getLabel('send')
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          conversations = _props.conversations,
          nextLoading = _props.nextLoading,
          push = _props.push,
          getLabel = _props.getLabel,
          createConversation = _props.createConversation,
          author = _props.author,
          initialValues = _props.initialValues,
          _props$settings = _props.settings,
          TitleComponent = _props$settings.TitleComponent,
          ContentWrapper = _props$settings.ContentWrapper,
          allowCreateConversation = _props$settings.allowCreateConversation,
          topListConversation = _props$settings.topListConversation,
          prefix = _props$settings.prefix;


      var allConversationsPast = conversations && conversations.length && conversations[0].resolvedAt;

      var content = _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 124
          }
        },
        topListConversation && allConversationsPast ? _react3.default.createElement(
          _react2.Fragment,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 125
            }
          },
          _react3.default.createElement(
            TitleComponent,
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 126
              }
            },
            getLabel('newConversation')
          ),
          _react3.default.createElement(
            'div',
            { className: 'media', __source: {
                fileName: _jsxFileName,
                lineNumber: 130
              }
            },
            _react3.default.createElement(
              'div',
              { className: 'media-left', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 131
                }
              },
              _react3.default.createElement(_components2.AuthorAvatar, { author: author, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 132
                }
              })
            ),
            _react3.default.createElement(
              'div',
              { className: 'media-body', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 134
                }
              },
              _react3.default.createElement(
                'h4',
                { className: 'media-heading margin-bottom-sm', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 135
                  }
                },
                getAuthorName(author)
              ),
              _react3.default.createElement(_components2.ConversationForm, {
                onSubmit: function onSubmit(data) {
                  return createConversation(data).then(function () {
                    var _ref4 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(result) {
                      var url;
                      return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              url = (0, _removeTrailingSlash2.default)(prefix) + ('/conversation/' + result.conversation.id);
                              _context2.next = 3;
                              return (0, _bluebird.resolve)(push(url));

                            case 3:
                              return _context2.abrupt('return', result);

                            case 4:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      }, _callee2, _this2);
                    }));

                    return function (_x2) {
                      return _ref4.apply(this, arguments);
                    };
                  }());
                },
                initialValues: initialValues,
                Wrapper: this.FromWrapper,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 137
                }
              })
            )
          )
        ) : null,
        allowCreateConversation && !topListConversation && _react3.default.createElement(
          'div',
          { className: 'pull-right', __source: {
              fileName: _jsxFileName,
              lineNumber: 152
            }
          },
          _react3.default.createElement(
            _components2.LinkContainer,
            { to: '/conversation/create', __source: {
                fileName: _jsxFileName,
                lineNumber: 153
              }
            },
            function (path) {
              return _react3.default.createElement(
                'button',
                {
                  className: 'btn btn-info btn-creation',
                  onClick: function onClick() {
                    return push(path);
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 155
                  }
                },
                getLabel('createConversation')
              );
            }
          )
        ),
        _react3.default.createElement(
          TitleComponent,
          { className: 'text-left margin-bottom-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 165
            }
          },
          getLabel(allConversationsPast ? 'pastConversations' : 'conversations')
        ),
        conversations && conversations.length ? _react3.default.createElement(_components2.ConversationList, { conversations: conversations, __source: {
            fileName: _jsxFileName,
            lineNumber: 169
          }
        }) : null,
        !conversations || !conversations.length ? _react3.default.createElement(
          'div',
          { className: 'text-center text-muted padding-v-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 172
            }
          },
          getLabel('noResult')
        ) : null,
        nextLoading && _react3.default.createElement(
          'div',
          { className: 'padding-v-md', style: { position: 'relative' }, __source: {
              fileName: _jsxFileName,
              lineNumber: 177
            }
          },
          _react3.default.createElement(_Spinner2.default, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 178
            }
          })
        ),
        _react3.default.createElement(_reactWaypoint2.default, { onEnter: this.throttledNextPage, __source: {
            fileName: _jsxFileName,
            lineNumber: 181
          }
        })
      );

      return ContentWrapper ? _react3.default.createElement(
        ContentWrapper,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 186
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