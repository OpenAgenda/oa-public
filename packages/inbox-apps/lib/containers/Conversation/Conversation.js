'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState,
        router = _ref.router;

    var state = getState();
    var promises = [];

    if (!conversationActions.isAuthorLoaded(state)) {
      promises.push(dispatch(conversationActions.loadAuthor()));
    }

    // if ( !conversationActions.isLoaded( state ) ) {
    promises.push(dispatch(conversationActions.load(router.params.conversationId)));
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
    conversation: state.conversation.data,
    messages: state.conversation.messages,
    loading: state.conversation.loading,
    nextLoading: state.conversation.nextLoading,
    lastPage: state.conversation.lastPage,
    res: state.res
  };
}, (0, _extends3.default)({}, conversationActions, { resetForm: _reduxForm.reset })), _dec4 = (0, _recompose.getContext)({
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
        var _this$props2, router, sendMessage, resetForm;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$props2 = _this.props, router = _this$props2.router, sendMessage = _this$props2.sendMessage, resetForm = _this$props2.resetForm;
                _context.next = 3;
                return (0, _bluebird.resolve)(sendMessage(router.params.conversationId, data));

              case 3:

                resetForm('message');

              case 4:
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
    _this.FromWrapper = _this.FromWrapper.bind(_this);
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
          messages = _props.messages;


      return _react3.default.createElement(
        'div',
        { className: 'media', __source: {
            fileName: _jsxFileName,
            lineNumber: 88
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'media-left media-top', __source: {
              fileName: _jsxFileName,
              lineNumber: 89
            }
          },
          _react3.default.createElement(_components2.MessageAvatar, { message: author, __source: {
              fileName: _jsxFileName,
              lineNumber: 90
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'media-body', __source: {
              fileName: _jsxFileName,
              lineNumber: 93
            }
          },
          _react3.default.createElement(
            'p',
            { className: 'author-name', __source: {
                fileName: _jsxFileName,
                lineNumber: 94
              }
            },
            getAuthorName(author)
          ),
          _react3.default.createElement(
            'form',
            { onSubmit: handleSubmit, className: 'message-form', __source: {
                fileName: _jsxFileName,
                lineNumber: 96
              }
            },
            children,
            _react3.default.createElement(
              'button',
              {
                type: 'submit',
                disabled: submitting,
                className: 'btn btn-primary margin-bottom-sm',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 99
                }
              },
              getLabel(messages && messages.length ? 'reply' : 'submit')
            )
          )
        )
      );
    }
  }, {
    key: 'renderForm',
    value: function renderForm() {
      var _props2 = this.props,
          conversation = _props2.conversation,
          triggerAction = _props2.triggerAction,
          getLabel = _props2.getLabel;


      if (conversation.resolvedAt) {
        return _react3.default.createElement(
          'div',
          { className: 'well text-center margin-top-sm', key: 'message-form', __source: {
              fileName: _jsxFileName,
              lineNumber: 117
            }
          },
          _react3.default.createElement('i', { className: 'fa fa-lock text-muted', 'aria-hidden': 'true', __source: {
              fileName: _jsxFileName,
              lineNumber: 118
            }
          }),
          ' ',
          getLabel('conversationAreResolved')
        );
      }

      if (!conversation.actions) {
        return _react3.default.createElement(_components2.MessageForm, {
          form: 'message',
          onSubmit: this.sendMessage,
          key: 'message-form',
          Wrapper: this.FromWrapper,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 126
          }
        });
      }

      return _react3.default.createElement(
        'div',
        { className: 'row', key: 'message-form', __source: {
            fileName: _jsxFileName,
            lineNumber: 136
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'col-sm-10', __source: {
              fileName: _jsxFileName,
              lineNumber: 137
            }
          },
          _react3.default.createElement(_components2.MessageForm, {
            form: 'message',
            onSubmit: this.sendMessage,
            Wrapper: this.FromWrapper,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 138
            }
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'col-sm-2', __source: {
              fileName: _jsxFileName,
              lineNumber: 144
            }
          },
          _react3.default.createElement(
            'p',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 145
              }
            },
            _react3.default.createElement(
              'b',
              {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 145
                }
              },
              getLabel('actions')
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'text-center', __source: {
                fileName: _jsxFileName,
                lineNumber: 147
              }
            },
            _react3.default.createElement(_components2.ActionsList, {
              onAction: triggerAction.bind(null, conversation.id),
              actions: conversation.actions,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 148
              }
            })
          )
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          messages = _props3.messages,
          nextLoading = _props3.nextLoading,
          res = _props3.res,
          getLabel = _props3.getLabel,
          _props3$settings = _props3.settings,
          TitleComponent = _props3$settings.TitleComponent,
          ContentWrapper = _props3$settings.ContentWrapper,
          focusFistConversation = _props3$settings.focusFistConversation;


      var content = [!focusFistConversation && _react3.default.createElement(
        'div',
        { key: 'return-to-inbox', __source: {
            fileName: _jsxFileName,
            lineNumber: 165
          }
        },
        _react3.default.createElement(
          _components2.Link,
          { to: res.inboxHome, __source: {
              fileName: _jsxFileName,
              lineNumber: 166
            }
          },
          getLabel('backToConversations')
        )
      ), this.renderForm(), messages && messages.length && _react3.default.createElement(_components2.MessageList, { messages: messages, key: 'list', __source: {
          fileName: _jsxFileName,
          lineNumber: 171
        }
      }), !messages || !messages.length && _react3.default.createElement(
        'div',
        { className: 'text-center text-muted margin-v-md', key: 'zero', __source: {
            fileName: _jsxFileName,
            lineNumber: 173
          }
        },
        getLabel('noResult')
      ), nextLoading && _react3.default.createElement(
        'div',
        { className: 'padding-v-md', style: { position: 'relative' }, key: 'spinner', __source: {
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
      ), _react3.default.createElement(_reactWaypoint2.default, { onEnter: this.throttledNextPage, key: 'waypoint', __source: {
          fileName: _jsxFileName,
          lineNumber: 181
        }
      })];

      return [_react3.default.createElement(_components2.Title, {
        tab: 'conversation',
        key: 'title',
        Component: TitleComponent,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 185
        }
      })].concat((0, _toConsumableArray3.default)(ContentWrapper ? [_react3.default.createElement(
        ContentWrapper,
        { key: 'contentWrapper', __source: {
            fileName: _jsxFileName,
            lineNumber: 192
          }
        },
        content
      )] : content));
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