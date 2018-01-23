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
    _jsxFileName = 'src/containers/ConversationCreate/ConversationCreate.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxConnect = require('redux-connect');

var _recompose = require('recompose');

var _components2 = require('../../components');

var _conversationForm = require('../../redux/modules/conversationForm');

var conversationFormActions = _interopRequireWildcard(_conversationForm);

var _inbox = require('../../redux/modules/inbox');

var inboxActions = _interopRequireWildcard(_inbox);

var _conversation = require('../../redux/modules/conversation');

var conversationActions = _interopRequireWildcard(_conversation);

var _modals = require('../../redux/modules/modals');

var modalActions = _interopRequireWildcard(_modals);

var _removeTrailingSlash = require('../../utils/removeTrailingSlash');

var _removeTrailingSlash2 = _interopRequireDefault(_removeTrailingSlash);

var _showBackLink = require('../../utils/showBackLink');

var _showBackLink2 = _interopRequireDefault(_showBackLink);

var _setFlashMessage = require('../../utils/setFlashMessage');

var _setFlashMessage2 = _interopRequireDefault(_setFlashMessage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ConversationCreate: {
    displayName: 'ConversationCreate'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/containers/ConversationCreate/ConversationCreate.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ConversationCreate = _wrapComponent('ConversationCreate')((_dec = (0, _reduxConnect.asyncConnect)([{
  promise: function () {
    var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2) {
      var _ref2$store = _ref2.store,
          dispatch = _ref2$store.dispatch,
          getState = _ref2$store.getState;
      var state, focusFistConversation, query;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              state = getState();
              focusFistConversation = state.settings.focusFistConversation;
              query = focusFistConversation ? { limit: 1 } : {};

              if (inboxActions.isLoaded(state)) {
                _context.next = 6;
                break;
              }

              _context.next = 6;
              return (0, _bluebird.resolve)(dispatch(inboxActions.load(query)));

            case 6:
              if (conversationActions.isAuthorLoaded(state)) {
                _context.next = 8;
                break;
              }

              return _context.abrupt('return', dispatch(conversationActions.loadAuthor()));

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function promise(_x) {
      return _ref.apply(this, arguments);
    };
  }()
}]), _dec2 = (0, _reactRedux.connect)(function (state) {
  return {
    initialValues: state.settings.defaultQuery,
    settings: state.settings,
    conversations: state.inbox.data,
    author: state.conversation.author
  };
}, (0, _extends3.default)({}, conversationFormActions, modalActions)), _dec3 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = _dec3(_class = function (_Component) {
  (0, _inherits3.default)(ConversationCreate, _Component);

  function ConversationCreate(props) {
    (0, _classCallCheck3.default)(this, ConversationCreate);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ConversationCreate.__proto__ || (0, _getPrototypeOf2.default)(ConversationCreate)).call(this, props));

    _this.FromWrapper = _this.FromWrapper.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(ConversationCreate, [{
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
            lineNumber: 54
          }
        },
        children,
        author.inbox && author.inbox.type !== 'user' && author.inboxUser ? _react3.default.createElement(
          'div',
          { className: 'margin-bottom-xs', __source: {
              fileName: _jsxFileName,
              lineNumber: 58
            }
          },
          getLabel('yourMessageWillBeSigned'),
          ' ',
          _react3.default.createElement(
            'b',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 58
              }
            },
            author.inbox.name
          )
        ) : null,
        belowMessageDesc ? _react3.default.createElement('div', { className: 'margin-bottom-xs', dangerouslySetInnerHTML: { __html: belowMessageDesc }, __source: {
            fileName: _jsxFileName,
            lineNumber: 62
          }
        }) : null,
        _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn btn-primary margin-top-xs', __source: {
              fileName: _jsxFileName,
              lineNumber: 65
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
          createConversation = _props2.createConversation,
          initialValues = _props2.initialValues,
          getLabel = _props2.getLabel,
          settings = _props2.settings,
          conversations = _props2.conversations,
          author = _props2.author,
          router = _props2.router,
          showModal = _props2.showModal;
      var TitleComponent = settings.TitleComponent,
          prefix = settings.prefix,
          ContentWrapper = settings.ContentWrapper,
          creationDescriptionLabel = settings.creationDescriptionLabel,
          maskCreationSubtitle = settings.maskCreationSubtitle,
          creationSubtitle = settings.creationSubtitle,
          inboxDesc = settings.inboxDesc,
          onConversationCreateRedirect = settings.onConversationCreateRedirect,
          onConversationCreateFlash = settings.onConversationCreateFlash;


      var content = _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 83
          }
        },
        maskCreationSubtitle ? null : _react3.default.createElement(
          TitleComponent,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 84
            }
          },
          creationSubtitle ? creationSubtitle : getLabel('newConversation')
        ),
        inboxDesc ? _react3.default.createElement(
          'p',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 88
            }
          },
          inboxDesc
        ) : null,
        (0, _showBackLink2.default)(settings, conversations) ? _react3.default.createElement(
          'div',
          { className: 'text-right margin-bottom-sm', __source: {
              fileName: _jsxFileName,
              lineNumber: 90
            }
          },
          _react3.default.createElement(
            _components2.LinkContainer,
            { to: '/', __source: {
                fileName: _jsxFileName,
                lineNumber: 91
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
                    lineNumber: 93
                  }
                },
                getLabel('showAllConversations')
              );
            }
          )
        ) : null,
        _react3.default.createElement('div', { className: 'clearfix', __source: {
            fileName: _jsxFileName,
            lineNumber: 103
          }
        }),
        creationDescriptionLabel ? _react3.default.createElement(
          'p',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 105
            }
          },
          creationDescriptionLabel
        ) : null,
        _react3.default.createElement(
          'div',
          { className: 'media', __source: {
              fileName: _jsxFileName,
              lineNumber: 107
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'media-left', __source: {
                fileName: _jsxFileName,
                lineNumber: 108
              }
            },
            _react3.default.createElement(_components2.AuthorAvatar, { author: author, __source: {
                fileName: _jsxFileName,
                lineNumber: 109
              }
            })
          ),
          _react3.default.createElement(
            'div',
            { className: 'media-body', __source: {
                fileName: _jsxFileName,
                lineNumber: 111
              }
            },
            _react3.default.createElement(
              'h4',
              { className: 'media-heading margin-bottom-sm', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 112
                }
              },
              getAuthorName(author)
            ),
            _react3.default.createElement(_components2.ConversationForm, {
              form: 'conversation-create',
              onSubmit: function onSubmit(data) {
                return createConversation(data).then(function (result) {
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
                }).catch(function (err) {
                  console.log('ERROR', err);
                });
              },
              initialValues: initialValues,
              Wrapper: this.FromWrapper,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 114
              }
            })
          )
        )
      );

      return ContentWrapper ? _react3.default.createElement(
        ContentWrapper,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 150
          }
        },
        content
      ) : content;
    }
  }]);
  return ConversationCreate;
}(_react2.Component)) || _class) || _class) || _class));

exports.default = ConversationCreate;


function getAuthorName(obj) {
  if (obj.inboxUser) {
    return obj.inboxUser.name;
  }

  return obj.inbox.name;
}
module.exports = exports['default'];
//# sourceMappingURL=ConversationCreate.js.map