"use strict";

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _labels = require('@openagenda/countries/labels.js');

var _labels2 = _interopRequireDefault(_labels);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',
  getDefaultProps: function getDefaultProps() {

    return {
      enabled: true
    };
  },
  extractCountryNames: function extractCountryNames() {
    var _this = this;

    return _labels2.default.map(function (c) {

      return {
        value: c.code,
        label: c[_this.props.lang]
      };
    });
  },
  onChange: function onChange(code) {

    this.props.onChange('countryCode', code);
  },
  render: function render() {
    var _this2 = this;

    return _react2.default.createElement(
      'div',
      { className: this.props.enabled ? 'form-group country' : 'form-group country disabled' },
      _react2.default.createElement(
        'label',
        null,
        this.props.getLabel('country')
      ),
      _react2.default.createElement(_reactSelect2.default, {
        disabled: !this.props.enabled,
        value: this.props.value,
        options: this.extractCountryNames(),
        onChange: function onChange(value) {
          return _this2.onChange(value ? value.value : value);
        },
        clearable: false })
    );
  }
});
//# sourceMappingURL=CountryField.js.map