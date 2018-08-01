"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _ageFields = require('@openagenda/labels/cibul-templates/age-fields');

var _ageFields2 = _interopRequireDefault(_ageFields);

var _flatten = require('@openagenda/labels/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = {
  get: require('lodash/get'),
  set: require('lodash/set')
};

var limits = {
  min: 0,
  max: 122
};

var defaults = {
  min: 0,
  max: 99
};

module.exports = function (_Component) {
  _inherits(AgeComponent, _Component);

  function AgeComponent() {
    _classCallCheck(this, AgeComponent);

    return _possibleConstructorReturn(this, (AgeComponent.__proto__ || Object.getPrototypeOf(AgeComponent)).apply(this, arguments));
  }

  _createClass(AgeComponent, [{
    key: 'getSelectOptions',
    value: function getSelectOptions(minValue) {

      var labels = (0, _flatten2.default)(_ageFields2.default, this.props.lang);
      var options = [];

      var min = minValue || limits.min;

      for (var i = 0; i < limits.max; i++) {

        if (min <= i) {

          options.push({
            value: i + '',
            label: i + ' ' + (i < 2 ? labels.year : labels.years)
          });
        }
      }

      return options;
    }
  }, {
    key: 'isEnabled',
    value: function isEnabled() {

      var min = parseInt(_.get(this.props.value, 'min', 'NaN'));
      var max = parseInt(_.get(this.props.value, 'max', 'NaN'));

      return !isNaN(min) || !isNaN(max);
    }
  }, {
    key: 'onChange',
    value: function onChange(field, choice) {

      var clean = parseInt(choice.value);

      this.props.onChange((0, _immutabilityHelper2.default)(this.props.value, _.set({}, field, {
        $set: isNaN(clean) ? null : clean
      })));
    }
  }, {
    key: 'toggleEnabled',
    value: function toggleEnabled() {
      var enable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


      var isEnabled = this.isEnabled();

      if (enable === true) {

        if (!isEnabled) this.initialize();
      } else if (enable === false) {

        if (isEnabled) this.disable();
      } else if (isEnabled) {

        this.disable();
      } else {

        this.initialize();
      }
    }
  }, {
    key: 'disable',
    value: function disable() {

      this.props.onChange({ min: null, max: null });
    }
  }, {
    key: 'initialize',
    value: function initialize() {

      this.props.onChange(defaults);
    }
  }, {
    key: 'render',
    value: function render() {

      var field = this.props.field;

      var labels = (0, _flatten2.default)(_ageFields2.default, this.props.lang);

      var min = _.get(this.props.value, 'min', '') + '';
      var max = _.get(this.props.value, 'max', '') + '';

      return _react2.default.createElement(
        'div',
        { className: 'age' },
        _react2.default.createElement('input', {
          type: 'checkbox',
          name: 'age',
          checked: this.isEnabled(),
          onChange: this.toggleEnabled.bind(this, null) }),
        _react2.default.createElement(
          'div',
          { className: 'age-inputs' },
          _react2.default.createElement(
            'label',
            { className: 'margin-right-sm' },
            labels.min
          ),
          _react2.default.createElement(_reactSelect2.default, {
            name: 'minage',
            value: min,
            options: this.getSelectOptions(),
            clearable: false,
            onChange: this.onChange.bind(this, 'min'),
            onFocus: this.toggleEnabled.bind(this, true),
            placeholder: labels.select
          }),
          _react2.default.createElement(
            'label',
            { className: 'margin-h-sm', htmlFor: 'maxage' },
            labels.max
          ),
          _react2.default.createElement(_reactSelect2.default, {
            name: 'maxage',
            value: max,
            options: this.getSelectOptions(this.props.value ? min : false),
            clearable: false,
            onChange: this.onChange.bind(this, 'max'),
            onFocus: this.toggleEnabled.bind(this, true),
            placeholder: labels.select
          })
        )
      );
    }
  }]);

  return AgeComponent;
}(_react.Component);
//# sourceMappingURL=Age.js.map