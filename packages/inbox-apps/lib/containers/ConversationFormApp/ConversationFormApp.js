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

var _camelCase2 = require('lodash/camelCase');

var _camelCase3 = _interopRequireDefault(_camelCase2);

var _upperFirst2 = require('lodash/upperFirst');

var _upperFirst3 = _interopRequireDefault(_upperFirst2);

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
    _jsxFileName = 'src/containers/ConversationFormApp/ConversationFormApp.js';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _recompose = require('recompose');

var _Modal = require('@openagenda/react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _inboxes = require('@openagenda/labels/inboxes');

var _inboxes2 = _interopRequireDefault(_inboxes);

var _conversationForm = require('../../redux/modules/conversationForm');

var actions = _interopRequireWildcard(_conversationForm);

var _components2 = require('../../components');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  ConversationModal: {
    displayName: 'ConversationModal'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src/containers/ConversationFormApp/ConversationFormApp.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ConversationModal = _wrapComponent('ConversationModal')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    opened: state.conversationForm.opened,
    lang: state.conversationForm.data.lang,
    initialValues: state.conversationForm.data
  };
}, actions), _dec2 = (0, _recompose.withContext)({
  lang: _propTypes2.default.string,
  getLabel: _propTypes2.default.func
}, function (_ref) {
  var lang = _ref.lang;
  return {
    lang: lang,
    getLabel: function getLabel(label) {
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (0, _labels2.default)(_inboxes2.default)(label, values, lang);
    }
  };
}), _dec3 = (0, _recompose.getContext)({
  getLabel: _propTypes2.default.func
}), _dec(_class = _dec2(_class = _dec3(_class = function (_Component) {
  (0, _inherits3.default)(ConversationModal, _Component);

  function ConversationModal(props) {
    (0, _classCallCheck3.default)(this, ConversationModal);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ConversationModal.__proto__ || (0, _getPrototypeOf2.default)(ConversationModal)).call(this, props));

    _this.state = {
      confirmationMessage: null
    };

    _this.FormWrapper = _this.FormWrapper.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(ConversationModal, [{
    key: 'close',
    value: function close() {
      var withError = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this.setState({
        confirmationMessage: !withError
      });
    }
  }, {
    key: 'FormWrapper',
    value: function FormWrapper(_ref2) {
      var children = _ref2.children,
          handleSubmit = _ref2.handleSubmit,
          error = _ref2.error;
      var getLabel = this.props.getLabel;

      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit, className: 'conversation-form', __source: {
            fileName: _jsxFileName,
            lineNumber: 52
          }
        },
        _react3.default.createElement(
          'div',
          { className: 'margin-v-md', __source: {
              fileName: _jsxFileName,
              lineNumber: 53
            }
          },
          children,
          error ? _react3.default.createElement(
            'p',
            { className: 'text-danger', __source: {
                fileName: _jsxFileName,
                lineNumber: 56
              }
            },
            error
          ) : null
        ),
        _react3.default.createElement(
          'button',
          {
            type: 'submit',
            className: 'btn btn-primary center-block',
            __source: {
              fileName: _jsxFileName,
              lineNumber: 59
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
          opened = _props.opened,
          createConversation = _props.createConversation,
          getLabel = _props.getLabel,
          initialValues = _props.initialValues;
      var confirmationMessage = this.state.confirmationMessage;


      if (!opened) {
        return null;
      }

      var type = initialValues.type;


      var modalTitle = type && getLabel('title' + (0, _upperFirst3.default)((0, _camelCase3.default)(type)));
      var modalDescription = type && getLabel('message' + (0, _upperFirst3.default)((0, _camelCase3.default)(type)));

      if (confirmationMessage !== null) {
        // success = true / fail = false
        return _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('newConversation'),
            onClose: function onClose() {
              _this2.setState({ confirmationMessage: null });
              _this2.props.closeConversationForm();
            },
            classNames: { overlay: 'popup-overlay big' },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 84
            }
          },
          _react3.default.createElement(
            'div',
            { className: 'margin-top-sm text-center', __source: {
                fileName: _jsxFileName,
                lineNumber: 92
              }
            },
            getLabel(confirmationMessage ? 'creationSuccess' : 'creationFail')
          )
        );
      }

      return _react3.default.createElement(
        _Modal2.default,
        {
          title: modalTitle || getLabel('newConversation'),
          visible: opened,
          onClose: function onClose() {
            return _this2.props.closeConversationForm();
          },
          classNames: { overlay: 'popup-overlay big' },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 100
          }
        },
        modalDescription && _react3.default.createElement('p', { dangerouslySetInnerHTML: { __html: modalDescription.replace(/\n/g, '<br />') }, __source: {
            fileName: _jsxFileName,
            lineNumber: 106
          }
        }),
        _react3.default.createElement(_components2.ConversationForm, {
          initialValues: initialValues,
          onSubmit: function onSubmit(values) {
            return createConversation(values).then(function () {
              return _this2.close();
            }).catch(function () {
              return _this2.close(true);
            });
          },
          Wrapper: this.FormWrapper,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 107
          }
        })
      );
    }
  }]);
  return ConversationModal;
}(_react2.Component)) || _class) || _class) || _class));

exports.default = ConversationModal;
module.exports = exports['default'];
//# sourceMappingURL=ConversationFormApp.js.map