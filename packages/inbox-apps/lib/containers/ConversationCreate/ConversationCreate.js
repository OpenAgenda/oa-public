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

var _removeTrailingSlash = require('../../utils/removeTrailingSlash');

var _removeTrailingSlash2 = _interopRequireDefault(_removeTrailingSlash);

var _showBackLink = require('../../utils/showBackLink');

var _showBackLink2 = _interopRequireDefault(_showBackLink);

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
}, conversationFormActions), _dec3 = (0, _recompose.getContext)({
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
      var getLabel = this.props.getLabel;


      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit, className: 'conversation-form', __source: {
            fileName: _jsxFileName,
            lineNumber: 51
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'margin-bottom-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 52
            }
          },
          children
        ),
        _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn btn-primary', __source: {
              fileName: _jsxFileName,
              lineNumber: 56
            }
          },
          getLabel('send')
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          createConversation = _props.createConversation,
          initialValues = _props.initialValues,
          getLabel = _props.getLabel,
          settings = _props.settings,
          conversations = _props.conversations,
          author = _props.author,
          router = _props.router;
      var TitleComponent = settings.TitleComponent,
          prefix = settings.prefix,
          ContentWrapper = settings.ContentWrapper;


      var content = _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 70
          }
        },
        _react3.default.createElement(
          TitleComponent,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 71
            }
          },
          getLabel('newConversation')
        ),
        (0, _showBackLink2.default)(settings, conversations) ? _react3.default.createElement(
          'div',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 75
            }
          },
          _react3.default.createElement(
            _components2.Link,
            { to: '/', __source: {
                fileName: _jsxFileName,
                lineNumber: 76
              }
            },
            getLabel('backToConversations')
          )
        ) : null,
        _react3.default.createElement(
          'div',
          { className: 'media', __source: {
              fileName: _jsxFileName,
              lineNumber: 79
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'media-left', __source: {
                fileName: _jsxFileName,
                lineNumber: 80
              }
            },
            _react3.default.createElement(_components2.AuthorAvatar, { author: author, __source: {
                fileName: _jsxFileName,
                lineNumber: 81
              }
            })
          ),
          _react3.default.createElement(
            'div',
            { className: 'media-body', __source: {
                fileName: _jsxFileName,
                lineNumber: 83
              }
            },
            _react3.default.createElement(
              'h4',
              { className: 'media-heading margin-bottom-sm', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 84
                }
              },
              getAuthorName(author)
            ),
            _react3.default.createElement(_components2.ConversationForm, {
              onSubmit: function onSubmit(data) {
                return createConversation(data).then(function (result) {
                  var url = (0, _removeTrailingSlash2.default)(prefix) + ('/conversation/' + result.conversation.id);
                  router.push(url);
                  return result;
                });
              },
              initialValues: initialValues,
              Wrapper: this.FromWrapper,
              __source: {
                fileName: _jsxFileName,
                lineNumber: 86
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
            lineNumber: 103
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