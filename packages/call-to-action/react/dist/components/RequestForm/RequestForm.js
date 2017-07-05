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

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxForm = require('redux-form');

var _form = require('../../utils/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  RequestForm: {
    displayName: 'RequestForm'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/RequestForm/RequestForm.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var RequestForm = _wrapComponent('RequestForm')((_dec = (0, _reduxForm.reduxForm)({
  form: 'request'
}), _dec(_class = (_temp = _class2 = function (_Component) {
  _inherits(RequestForm, _Component);

  function RequestForm(props) {
    _classCallCheck(this, RequestForm);

    var _this = _possibleConstructorReturn(this, (RequestForm.__proto__ || Object.getPrototypeOf(RequestForm)).call(this, props));

    _this.renderField = _form.renderField.bind(_this);
    _this.renderMarkdownInput = _form.renderMarkdownInput.bind(_this);
    return _this;
  }

  _createClass(RequestForm, [{
    key: 'render',
    value: function render() {
      var handleSubmit = this.props.handleSubmit;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'form',
        { onSubmit: handleSubmit },
        _react3.default.createElement(_reduxForm.Field, {
          name: 'subject',
          component: 'input',
          type: 'hidden'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          name: 'agenda',
          component: 'input',
          type: 'hidden'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          name: 'url',
          component: 'input',
          type: 'hidden'
        }),
        _react3.default.createElement(_reduxForm.Field, {
          label: getLabel('message'),
          component: this.renderMarkdownInput,
          name: 'message',
          classNameGroup: 'margin-top-md margin-bottom-lg',
          displayFeedback: false
        }),
        _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn btn-primary center-block' },
          getLabel('send')
        )
      );
    }
  }]);

  return RequestForm;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func
}, _temp)) || _class));

exports.default = RequestForm;
module.exports = exports['default'];