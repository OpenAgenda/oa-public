"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({

  displayName: 'SearchField',

  propTypes: {
    value: _propTypes2.default.string,
    name: _propTypes2.default.string,
    loading: _propTypes2.default.bool
  },

  getDefaultProps: function getDefaultProps() {

    return {
      value: '',
      name: 'search',
      loading: false
    };
  },

  onChange: function onChange(e) {

    this.props.onChange(e.target.value);
  },

  onCommit: function onCommit(e) {

    e.preventDefault();

    if (typeof e.keyCode == 'undefined' || e.keyCode == 13) {

      this.props.onChange(this.props.value);
    }
  },

  renderSpinner: function renderSpinner() {

    return _react2.default.createElement(_Spinner2.default, {
      loading: true,
      spinner: { width: 1, length: 3, radius: 4, color: '#666' }
    });
  },

  render: function render() {

    return _react2.default.createElement(
      'div',
      { className: this.props.dynamic ? 'search-field' : 'search-field input-group' },
      _react2.default.createElement(
        'label',
        { className: 'sr-only', htmlFor: this.props.name },
        this.props.label
      ),
      _react2.default.createElement('input', {
        placeholder: this.props.placeholder,
        type: 'text',
        className: 'form-control',
        onChange: this.onChange,
        onKeyUp: this.onCommit,
        value: this.props.value || '' }),
      _react2.default.createElement(
        'span',
        { className: 'input-group-btn' },
        _react2.default.createElement(
          'button',
          {
            className: 'btn btn-default',
            type: 'button',
            onClick: this.onCommit },
          this.props.loading ? this.renderSpinner() : null,
          _react2.default.createElement('i', { style: this.props.loading ? { visibility: 'hidden' } : {}, className: 'fa fa-search' })
        )
      )
    );
  }

});
//# sourceMappingURL=SearchField.js.map