"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _EventItem = require('./components/EventItem');

var _EventItem2 = _interopRequireDefault(_EventItem);

var _references = require('labels/event/references');

var _references2 = _interopRequireDefault(_references);

var _labels = require('labels');

var _labels2 = _interopRequireDefault(_labels);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLabel = (0, _labels2.default)(_references2.default);

exports.default = _react2.default.createClass({
  displayName: 'Show',


  propTypes: {
    events: _react.PropTypes.array,
    lang: _react.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {

    return {
      lang: 'fr'
    };
  },
  translateEvent: function translateEvent(event) {

    return {
      title: event.title[this.props.lang],
      location: {
        name: event.location.name,
        address: event.location.address
      },
      dateRange: event.dateRange[this.props.lang]
    };
  },
  render: function render() {
    var _this = this;

    return _react2.default.createElement(
      'div',
      { className: 'event-references show' },
      _react2.default.createElement(
        'h3',
        null,
        getLabel('showTitle', this.props.lang)
      ),
      _react2.default.createElement(
        'div',
        { className: 'media content wsq' },
        this.props.events.map(function (e) {
          return _react2.default.createElement(_EventItem2.default, { event: _this.translateEvent(e) });
        })
      )
    );
  }
});
module.exports = exports['default'];