"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {
    event: _propTypes2.default.object,
    onRemove: _propTypes2.default.func,
    onClick: _propTypes2.default.func
  },

  onClick: function onClick(e) {

    if (this.props.onClick) {

      e.preventDefault();

      this.props.onClick(this.props.event);
    }
  },
  onRemove: function onRemove(e) {

    e.preventDefault();

    if (!this.props.onRemove) return;

    this.props.onRemove(this.props.event.uid);
  },
  render: function render() {

    return _react2.default.createElement(
      'div',
      { className: 'media', onClick: this.onClick },
      this.props.event.image ? _react2.default.createElement(
        'div',
        { className: 'media-left' },
        _react2.default.createElement(
          'a',
          { className: 'event-pic', href: this.props.event.link || '#' },
          _react2.default.createElement('img', { className: 'media-object', src: this.props.event.image })
        )
      ) : null,
      this.props.onRemove ? _react2.default.createElement(
        'a',
        { href: '#', className: 'pull-right remove', onClick: this.onRemove },
        _react2.default.createElement('i', { className: 'fa fa-trash' })
      ) : null,
      _react2.default.createElement(
        'div',
        { className: 'media-body' },
        _react2.default.createElement(
          'a',
          { href: this.props.event.link || '#' },
          _react2.default.createElement(
            'h4',
            { className: 'media-heading' },
            this.props.event.title
          ),
          _react2.default.createElement(
            'ul',
            { className: 'list-unstyled' },
            _react2.default.createElement(
              'li',
              null,
              this.props.event.location.name,
              ', ',
              this.props.event.location.address
            ),
            _react2.default.createElement(
              'li',
              null,
              this.props.event.dateRange
            )
          )
        )
      )
    );
  }
});