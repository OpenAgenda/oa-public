"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _bodyScroll = require('./body-scroll');

var _bodyScroll2 = _interopRequireDefault(_bodyScroll);

var _spin = require('spin.js');

var _spin2 = _interopRequireDefault(_spin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Spinner = function Spinner(props) {
  return _react2.default.createElement(SpinnerComponent, props);
};

exports.default = Spinner;


Spinner.propTypes = {
  loading: _propTypes2.default.bool,
  page: _propTypes2.default.bool,
  message: _propTypes2.default.string,
  options: _propTypes2.default.object // spin.js options
};

var SpinnerComponent = (0, _createReactClass2.default)({
  getDefaultProps: function getDefaultProps() {

    return {
      loading: true,
      page: false, // DEPRECATE this
      mode: false, // page, inline
      message: null,
      options: null
    };
  },
  componentDidMount: function componentDidMount() {

    this.spinner = new _spin2.default(this.getSpinOptions());

    this.evaluate();
  },
  componentDidUpdate: function componentDidUpdate() {

    this.evaluate();
  },
  getSpinOptions: function getSpinOptions() {

    if (this.props.options) return this.props.options;

    if (this.props.mode === 'inline') {

      return {
        width: 1,
        length: 2,
        radius: 4,
        color: '#666'
      };
    }

    return {
      width: 1,
      length: 6,
      radius: 10,
      color: '#666'
    };
  },
  componentWillUnmount: function componentWillUnmount() {

    if (this.props.page) _bodyScroll2.default.enable();
  },
  evaluate: function evaluate() {

    if (this.props.loading) {

      this.spinner.spin(_reactDom2.default.findDOMNode(this.refs.canvas));

      if (this.props.page) _bodyScroll2.default.disable();
    } else {

      this.spinner.stop();

      if (this.props.page) _bodyScroll2.default.enable();
    }
  },
  render: function render() {

    var classes = [this.props.mode === 'inline' ? 'spin-inline' : 'spin-center'];

    if (this.props.loading) classes.push('spin-canvas');

    if (this.props.page || this.props.mode === 'page') classes.push('spin-page');

    return _react2.default.createElement(
      'div',
      { className: classes.join(' ') },
      _react2.default.createElement(
        'div',
        { ref: 'canvas', style: this.props.mode !== 'inline' ? {
            position: 'absolute',
            width: 0,
            zIndex: 2000000000,
            left: '50%',
            top: '50%'
          } : {} },
        this.props.message ? _react2.default.createElement(
          'span',
          { className: 'spin-message' },
          this.props.message
        ) : null
      )
    );
  }
});
module.exports = exports['default'];