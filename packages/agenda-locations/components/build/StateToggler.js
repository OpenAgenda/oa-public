"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _rcSwitch = require('rc-switch');

var _rcSwitch2 = _interopRequireDefault(_rcSwitch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {

    // current location state
    locationState: _propTypes2.default.number,
    // state setter
    set: _propTypes2.default.func,
    // label getter
    getLabel: _propTypes2.default.func

  },

  onChange: function onChange(b) {

    this.props.set('state', b ? 1 : 0);
  },

  render: function render() {

    return _react2.default.createElement(
      'div',
      { className: 'state' },
      _react2.default.createElement(_rcSwitch2.default, {
        checked: this.props.locationState === 1,
        onChange: this.onChange,
        checkedChildren: _react2.default.createElement('i', { className: 'fa fa-check' }),
        unCheckedChildren: _react2.default.createElement('i', { className: 'fa fa-bell-o' }) }),
      _react2.default.createElement(
        'span',
        null,
        this.props.getLabel(this.props.locationState === 1 ? 'verified' : 'toverify')
      )
    );
  }

});
//# sourceMappingURL=StateToggler.js.map