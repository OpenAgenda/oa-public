"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _EventItem = require('./components/EventItem');

var _EventItem2 = _interopRequireDefault(_EventItem);

var _references = require('@openagenda/labels/event/references');

var _references2 = _interopRequireDefault(_references);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLabel = (0, _labels2.default)(_references2.default);

exports.default = (0, _createReactClass2.default)({
  displayName: 'Show',


  propTypes: {
    events: _propTypes2.default.array,
    lang: _propTypes2.default.string
  },

  getDefaultProps: function getDefaultProps() {

    return {
      lang: 'fr'
    };
  },
  cleanEvent: function cleanEvent(event) {

    return {
      title: event.title[this.props.lang],
      link: event.link || '#',
      image: event.image || false,
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
        { className: 'wsq' },
        this.props.events.map(function (e) {
          return _react2.default.createElement(_EventItem2.default, { key: e.uid, event: _this.cleanEvent(e) });
        })
      )
    );
  }
});
module.exports = exports['default'];