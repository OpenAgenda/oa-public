"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _EventItem = _interopRequireDefault(require("./components/EventItem"));

var _references = _interopRequireDefault(require("@openagenda/labels/event/references"));

var _labels = _interopRequireDefault(require("@openagenda/labels"));

var _jsxFileName = "/home/bertho/oa/packages/agenda-event-references/react/src/Show.js";
var getLabel = (0, _labels.default)(_references.default);

var _default = (0, _createReactClass.default)({
  displayName: "Show",
  propTypes: {
    events: _propTypes.default.array,
    lang: _propTypes.default.string
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

    return _react.default.createElement("div", {
      className: "event-references show",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 42
      },
      __self: this
    }, _react.default.createElement("h3", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 44
      },
      __self: this
    }, getLabel('showTitle', this.props.lang)), _react.default.createElement("div", {
      className: "wsq",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 46
      },
      __self: this
    }, this.props.events.map(function (e) {
      return _react.default.createElement(_EventItem.default, {
        key: e.uid,
        event: _this.cleanEvent(e),
        __source: {
          fileName: _jsxFileName,
          lineNumber: 48
        },
        __self: this
      });
    })));
  }
});

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=Show.js.map