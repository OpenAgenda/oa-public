"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _TermSelector = require('./TermSelector');

var _TermSelector2 = _interopRequireDefault(_TermSelector);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {

    value: _propTypes2.default.object,

    lang: _propTypes2.default.string,

    fields: _propTypes2.default.object,

    // field showing by default
    defaultField: _propTypes2.default.string,

    res: _propTypes2.default.string,

    // labels for the field listed
    labels: _propTypes2.default.object,

    onChange: _propTypes2.default.func

  },

  /**
   * get field currently selected
   * should be the last ( smallest ) of possibles
   * that has a value set
   */
  getField: function getField() {

    var possibles = Object.keys(this.props.fields);

    for (var i = possibles.length - 1; i >= 0; i--) {

      if (this.props.value[possibles[i]] !== undefined) {

        return possibles[i];
      }
    }

    return this.props.defaultField || possibles[possibles.length - 1];
  },

  getFieldValue: function getFieldValue() {

    return this.props.fields[this.getField()];
  },

  getDefaultProps: function getDefaultProps() {

    return {
      lang: 'en'
    };
  },

  getFieldOptions: function getFieldOptions() {

    var self = this;

    return Object.keys(this.props.fields).map(function (f) {

      return {
        value: f,
        label: self.props.labels[f][self.props.lang]
      };
    });
  },

  onChangeField: function onChangeField(field) {

    var value = {};

    value[field] = null;

    this.props.onChange(value);
  },

  onChange: function onChange(value) {

    var clean = {};

    this.getFieldValue().split(',').forEach(function (f) {

      clean[f] = (value || {})[f] || '';
    });

    this.props.onChange(clean);
  },

  render: function render() {
    var _this = this;

    return _react2.default.createElement(
      'div',
      { className: 'picked-terms-selector' },
      _react2.default.createElement(_reactSelect2.default, {
        value: this.getField(),
        options: this.getFieldOptions(),
        onChange: function onChange(value) {
          return _this.onChangeField(value ? value.value : value);
        },
        autoBlur: true,
        clearable: false,
        searchable: false }),
      _react2.default.createElement(_TermSelector2.default, {
        res: this.props.res,
        lang: this.props.lang,
        field: this.getFieldValue(),
        value: this.props.value[this.getField()],
        onChange: this.onChange
      })
    );
  }

});
//# sourceMappingURL=TermSelectorPicker.js.map