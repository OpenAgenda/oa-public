"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTagsinput = require('react-tagsinput');

var _reactTagsinput2 = _interopRequireDefault(_reactTagsinput);

var _Sub = require('@openagenda/form-schemas/client/build/lib/Sub');

var _Sub2 = _interopRequireDefault(_Sub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = {
  get: require('lodash/get'),
  keys: require('lodash/keys')
};

var validates = {
  email: require('@openagenda/validators/email')(),
  phone: require('@openagenda/validators/phone')(),
  link: require('@openagenda/validators/link')()
};

var iconClasses = {
  link: 'fa fa-link',
  phone: 'fa fa-phone',
  email: 'fa fa-envelope',
  error: 'fa fa-exclamation-circle'
};

module.exports = function (_Component) {
  _inherits(RegistrationComponent, _Component);

  function RegistrationComponent() {
    _classCallCheck(this, RegistrationComponent);

    return _possibleConstructorReturn(this, (RegistrationComponent.__proto__ || Object.getPrototypeOf(RegistrationComponent)).apply(this, arguments));
  }

  _createClass(RegistrationComponent, [{
    key: 'renderTag',
    value: function renderTag(t) {
      var key = t.key,
          value = t.tag,
          onRemove = t.onRemove,
          className = t.className;


      var type = this.getType(value);

      return _react2.default.createElement(
        'span',
        { key: key, className: className + (type === 'error' ? ' error' : '') },
        _react2.default.createElement('i', { className: iconClasses[type] }),
        value,
        _react2.default.createElement('a', { onClick: onRemove.bind(null, key) })
      );
    }
  }, {
    key: 'getType',
    value: function getType(value) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {

        for (var _iterator = _.keys(validates)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var valueType = _step.value;


          try {

            validates[valueType](value);

            return valueType;
          } catch (e) {}
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return 'error';
    }
  }, {
    key: 'render',
    value: function render() {

      var field = this.props.field;

      var values = this.props.value || [];

      var errors = this.props.errors;

      return _react2.default.createElement(
        'div',
        { className: 'registration' },
        _react2.default.createElement(_reactTagsinput2.default, {
          value: values,
          onChange: this.props.onChange,
          renderTag: this.renderTag.bind(this),
          inputProps: {
            placeholder: field.placeholder,
            style: !values.length ? { width: '630px' } : null
          }
        })
      );
    }
  }]);

  return RegistrationComponent;
}(_react.Component);
//# sourceMappingURL=Registration.js.map