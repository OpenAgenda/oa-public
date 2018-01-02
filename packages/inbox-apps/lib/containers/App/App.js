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
    _jsxFileName = 'src/containers/App/App.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _recompose = require('recompose');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _inboxes = require('@openagenda/labels/inboxes');

var _inboxes2 = _interopRequireDefault(_inboxes);

var _Modal = require('@openagenda/react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _modals = require('../../redux/modules/modals');

var modalActions = _interopRequireWildcard(_modals);

require('moment/locale/fr');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  App: {
    displayName: 'App'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/containers/App/App.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var App = _wrapComponent('App')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    settings: state.settings,
    modals: state.modals
  };
}, (0, _extends3.default)({}, modalActions)), _dec2 = (0, _recompose.withContext)({
  lang: _propTypes2.default.string,
  getLabel: _propTypes2.default.func
}, function (_ref) {
  var settings = _ref.settings;
  return {
    lang: settings.lang,
    getLabel: function getLabel(label) {
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (0, _labels2.default)(_inboxes2.default)(label, values, settings.lang);
    }
  };
}), _dec3 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = _dec3(_class = function (_Component) {
  (0, _inherits3.default)(App, _Component);

  function App() {
    (0, _classCallCheck3.default)(this, App);
    return (0, _possibleConstructorReturn3.default)(this, (App.__proto__ || (0, _getPrototypeOf2.default)(App)).apply(this, arguments));
  }

  (0, _createClass3.default)(App, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      _moment2.default.locale(this.props.lang || 'fr');
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          modals = _props.modals,
          closeModal = _props.closeModal,
          Wrapper = _props.settings.Wrapper,
          children = _props.children,
          getLabel = _props.getLabel;


      var messageSentModal = modals && modals.messageSent || {};
      var closeConfirmationModal = modals && modals.closeConfirmation || {};

      var content = _react3.default.createElement(
        _react2.Fragment,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 49
          }
        },
        children,
        messageSentModal.visible ? _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('messageSent'),
            onClose: function onClose() {
              return closeModal('messageSent');
            },
            classNames: { overlay: 'popup-overlay big' },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 52
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'margin-top-sm text-center', __source: {
                fileName: _jsxFileName,
                lineNumber: 57
              }
            },
            getLabel('yourMessageHasBeenSent')
          ),
          _react3.default.createElement(
            'div',
            { className: 'margin-top-sm text-center', __source: {
                fileName: _jsxFileName,
                lineNumber: 58
              }
            },
            _react3.default.createElement(
              'button',
              { className: 'btn btn-primary', onClick: function onClick() {
                  return closeModal('messageSent');
                }, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 59
                }
              },
              getLabel('close')
            )
          )
        ) : null,
        closeConfirmationModal.visible ? _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('closeConfirmation'),
            onClose: function onClose() {
              return closeModal('closeConfirmation');
            },
            classNames: { overlay: 'popup-overlay big' },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 65
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'margin-top-sm text-center', __source: {
                fileName: _jsxFileName,
                lineNumber: 70
              }
            },
            getLabel('closeConversationDesc')
          ),
          _react3.default.createElement(
            'div',
            { className: 'margin-top-sm', __source: {
                fileName: _jsxFileName,
                lineNumber: 71
              }
            },
            _react3.default.createElement(
              'button',
              { className: 'btn btn-primary', onClick: function onClick() {
                  return closeModal('closeConfirmation');
                }, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 72
                }
              },
              getLabel('cancel')
            ),
            _react3.default.createElement(
              'button',
              { className: 'btn btn-danger pull-right', onClick: (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                  return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.next = 2;
                          return (0, _bluebird.resolve)(closeConfirmationModal.params.onAction(closeConfirmationModal.params.action.code));

                        case 2:
                          closeModal('closeConfirmation');

                        case 3:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, _this2);
                })), __source: {
                  fileName: _jsxFileName,
                  lineNumber: 75
                }
              },
              getLabel('close')
            )
          )
        ) : null
      );

      if (Wrapper) {
        return _react3.default.createElement(
          Wrapper,
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 88
            }
          },
          content
        );
      }

      return content;
    }
  }]);
  return App;
}(_react2.Component)) || _class) || _class) || _class));

exports.default = App;
module.exports = exports['default'];
//# sourceMappingURL=App.js.map