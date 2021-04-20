"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.function.name");

require("core-js/modules/es.string.link");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _EventItem = _interopRequireDefault(require("./components/EventItem"));

var _references = _interopRequireDefault(require("@openagenda/labels/event/references"));

var _labels = _interopRequireDefault(require("@openagenda/labels"));

var _jsxFileName = "/home/clement/Project/oa/packages/agenda-event-references/react/src/Show.js";
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
    var _context,
        _this = this;

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "event-references show",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 42,
        columnNumber: 12
      }
    }, /*#__PURE__*/_react.default.createElement("h3", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 44,
        columnNumber: 7
      }
    }, getLabel('showTitle', this.props.lang)), /*#__PURE__*/_react.default.createElement("div", {
      className: "wsq",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 46,
        columnNumber: 7
      }
    }, (0, _map.default)(_context = this.props.events).call(_context, function (e) {
      return /*#__PURE__*/_react.default.createElement(_EventItem.default, {
        key: e.uid,
        event: _this.cleanEvent(e),
        __self: _this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 48,
          columnNumber: 38
        }
      });
    })));
  }
});

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=Show.js.map