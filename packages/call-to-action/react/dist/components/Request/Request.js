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

var _dec, _class;

var _Modal = require('react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _reactRedux = require('react-redux');

var _callToAction = require('../../redux/modules/callToAction');

var actions = _interopRequireWildcard(_callToAction);

var _ = require('../');

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
  filename: 'react/src/components/Request/Request.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var Request = _wrapComponent('Request')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    opened: state.callToAction.opened,
    subject: state.callToAction.subject,
    agenda: state.callToAction.agenda,
    title: state.callToAction.title,
    options: state.callToAction.options
  };
}, actions), _dec(_class = function (_Component) {
  _inherits(Request, _Component);

  function Request() {
    _classCallCheck(this, Request);

    return _possibleConstructorReturn(this, (Request.__proto__ || Object.getPrototypeOf(Request)).apply(this, arguments));
  }

  _createClass(Request, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          opened = _props.opened,
          closeRequestForm = _props.closeRequestForm,
          subject = _props.subject,
          agenda = _props.agenda,
          title = _props.title;


      return _react3.default.createElement(
        _Modal2.default,
        {
          title: title || 'Demande d\'activation',
          visible: opened,
          onClose: function onClose() {
            return closeRequestForm();
          },
          classNames: { overlay: 'popup-overlay big' }
        },
        _react3.default.createElement(_.RequestForm, null)
      );
    }
  }]);

  return Request;
}(_react2.Component)) || _class));

exports.default = Request;
module.exports = exports['default'];