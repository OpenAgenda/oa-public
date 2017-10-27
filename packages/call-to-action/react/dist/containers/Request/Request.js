'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _class2, _temp2;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Modal = require('@openagenda/react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _reactRedux = require('react-redux');

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _callToAction = require('@openagenda/labels/call-to-action');

var _callToAction2 = _interopRequireDefault(_callToAction);

var _callToAction3 = require('../../redux/modules/callToAction');

var actions = _interopRequireWildcard(_callToAction3);

var _index = require('../../components/index');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  Request: {
    displayName: 'Request'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/Request/Request.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var ucfirst = function ucfirst(str) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
};

var Request = _wrapComponent('Request')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    lang: state.callToAction.lang,
    opened: state.callToAction.opened,
    subject: state.callToAction.subject,
    agenda: state.callToAction.agenda,
    options: state.callToAction.options
  };
}, actions), _dec(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(Request, _Component);

  function Request() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Request);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Request.__proto__ || Object.getPrototypeOf(Request)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      confirmationMessage: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Request, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var lang = this.props.lang;


      return {
        lang: lang,
        getLabel: function getLabel(label) {
          var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return (0, _labels2.default)(_callToAction2.default)(label, values, lang);
        }
      };
    }
  }, {
    key: 'close',
    value: function close() {
      var withError = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this.props.closeRequestForm();
      this.setState({
        confirmationMessage: !withError
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          opened = _props.opened,
          sendRequestForm = _props.sendRequestForm,
          subject = _props.subject,
          agenda = _props.agenda;
      var confirmationMessage = this.state.confirmationMessage;

      var _getChildContext = this.getChildContext(),
          getLabel = _getChildContext.getLabel;

      var modalTitle = subject && getLabel('requestTitle' + ucfirst(subject));
      var modalDescription = subject && getLabel('requestMessage' + ucfirst(subject));

      if (confirmationMessage !== null) {
        // success = true / fail = false
        return _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('confirmationMessage'),
            onClose: function onClose() {
              return _this2.setState({ confirmationMessage: null });
            },
            classNames: { overlay: 'popup-overlay big' }
          },
          _react3.default.createElement(
            'div',
            { className: 'margin-top-sm text-center' },
            confirmationMessage ? getLabel('requestSuccess') : getLabel('requestFail')
          )
        );
      }

      return _react3.default.createElement(
        _Modal2.default,
        {
          title: _react3.default.createElement(
            'div',
            null,
            _react3.default.createElement('i', { className: 'golden-icon no-hover' }),
            ' ',
            modalTitle || getLabel('activationRequest')
          ),
          visible: opened,
          onClose: function onClose() {
            return _this2.props.closeRequestForm();
          },
          classNames: { overlay: 'popup-overlay big' }
        },
        modalDescription && _react3.default.createElement('p', { dangerouslySetInnerHTML: { __html: modalDescription.replace(/\n/g, '<br />') } }),
        _react3.default.createElement(_index.RequestForm, {
          subject: subject,
          initialValues: { subject: subject, agenda: agenda, url: window.location.href },
          onSubmit: function onSubmit(values) {
            return sendRequestForm(values).then(function () {
              return _this2.close();
            }).catch(function () {
              return _this2.close(true);
            });
          }
        })
      );
    }
  }]);

  return Request;
}(_react2.Component), _class2.childContextTypes = {
  lang: _propTypes2.default.string,
  getLabel: _propTypes2.default.func
}, _temp2)) || _class));

exports.default = Request;
module.exports = exports['default'];
//# sourceMappingURL=Request.js.map