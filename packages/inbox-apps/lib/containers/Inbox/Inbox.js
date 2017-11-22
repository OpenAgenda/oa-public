'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Spinner = require('@openagenda/react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _components2 = require('../../components');

var _inbox = require('../../redux/modules/inbox');

var inboxActions = _interopRequireWildcard(_inbox);

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
  promise: function () {
    var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2) {
      var _ref2$store = _ref2.store,
          dispatch = _ref2$store.dispatch,
          getState = _ref2$store.getState,
          redirect = _ref2.helpers.redirect;

      var state, _state$settings, prefix, focusFistConversation, hideEmptyList, query, result;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              state = getState();
              _state$settings = state.settings, prefix = _state$settings.prefix, focusFistConversation = _state$settings.focusFistConversation, hideEmptyList = _state$settings.hideEmptyList;
              query = focusFistConversation ? { limit: 1 } : {};
              _context.next = 5;
              return (0, _bluebird.resolve)(dispatch(inboxActions.load(query)));

            case 5:
              result = _context.sent;

              if (!(hideEmptyList && result.conversations && !result.conversations.length)) {
                _context.next = 8;
                break;
              }

              return _context.abrupt('return', redirect((0, _removeTrailingSlash2.default)(prefix) + '/conversation/create'));

            case 8:
              if (!focusFistConversation) {
                _context.next = 10;
                break;
              }

              return _context.abrupt('return', redirect((0, _removeTrailingSlash2.default)(prefix) + '/conversation/' + result.conversations[0].id));

            case 10:
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
    settings: state.settings,
    conversations: state.inbox.data,
    loading: state.inbox.loading,
    nextLoading: state.inbox.nextLoading,
    lastPage: state.inbox.lastPage
  };
}, (0, _extends3.default)({}, inboxActions, { push: _reactRouterRedux.push })), _dec3 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = _dec3(_class = function (_Component) {
  (0, _inherits3.default)(Inbox, _Component);

  function Inbox() {
    var _ref3;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Inbox);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref3 = Inbox.__proto__ || (0, _getPrototypeOf2.default)(Inbox)).call.apply(_ref3, [this].concat(args))), _this), _this.nextPage = function () {
      var _this$props = _this.props,
          lastPage = _this$props.lastPage,
          loading = _this$props.loading,
          nextLoading = _this$props.nextLoading,
          conversations = _this$props.conversations;


      if (!conversations || !conversations.length || loading || nextLoading || lastPage) {
        return;
      }

      _this.props.nextPage();
    }, _this.throttledNextPage = (0, _throttle3.default)(_this.nextPage, 400, { trailing: false }), _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Inbox, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          conversations = _props.conversations,
          nextLoading = _props.nextLoading,
          push = _props.push,
          getLabel = _props.getLabel,
          _props$settings = _props.settings,
          TitleComponent = _props$settings.TitleComponent,
          ContentWrapper = _props$settings.ContentWrapper,
          allowCreateConversation = _props$settings.allowCreateConversation;


      var content = [conversations && conversations.length ? _react3.default.createElement(_components2.ConversationList, { conversations: conversations, key: 'list', __source: {
          fileName: _jsxFileName,
          lineNumber: 70
        }
      }) : null, !conversations || !conversations.length ? _react3.default.createElement(
        'div',
        {
          className: 'text-center text-muted padding-v-md',
          key: 'zero',
          __source: {
            fileName: _jsxFileName,
            lineNumber: 73
          }
        },
        getLabel('noResult')
      ) : null, nextLoading && _react3.default.createElement(
        'div',
        { className: 'padding-v-md', style: { position: 'relative' }, key: 'spinner', __source: {
            fileName: _jsxFileName,
            lineNumber: 81
          }
        },
        _react3.default.createElement(_Spinner2.default, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 82
          }
        })
      ), _react3.default.createElement(_reactWaypoint2.default, { onEnter: this.throttledNextPage, key: 'waypoint', __source: {
          fileName: _jsxFileName,
          lineNumber: 85
        }
      })];

      return [_react3.default.createElement(_components2.Title, {
        tab: 'inbox',
        key: 'title',
        Component: TitleComponent,
        className: (0, _classnames2.default)({
          'pull-left': allowCreateConversation
        }),
        __source: {
          fileName: _jsxFileName,
          lineNumber: 89
        }
      }), allowCreateConversation && _react3.default.createElement(
        'div',
        { key: 'button-create', className: 'text-right', __source: {
            fileName: _jsxFileName,
            lineNumber: 98
          }
        },
        _react3.default.createElement(
          _components2.LinkContainer,
          { to: '/conversation/create', __source: {
              fileName: _jsxFileName,
              lineNumber: 99
            }
          },
          function (path) {
            return _react3.default.createElement(
              'button',
              {
                className: 'btn btn-info margin-top-md',
                onClick: function onClick() {
                  return push(path);
                },
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 101
                }
              },
              getLabel('createConversation')
            );
          }
        )
      )].concat((0, _toConsumableArray3.default)(ContentWrapper ? [_react3.default.createElement(
        ContentWrapper,
        { key: 'contentWrapper', __source: {
            fileName: _jsxFileName,
            lineNumber: 112
          }
        },
        content
      )] : content));
    }
  }]);
  return Inbox;
}(_react2.Component)) || _class) || _class) || _class));

exports.default = Inbox;
;
module.exports = exports['default'];
//# sourceMappingURL=Inbox.js.map