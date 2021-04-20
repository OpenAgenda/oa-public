"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

require("core-js/modules/es.function.name");

require("core-js/modules/es.string.link");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _jsxFileName = "/home/clement/Project/oa/packages/agenda-event-references/react/src/components/EventItem.js";
module.exports = (0, _createReactClass.default)({
  displayName: "exports",
  propTypes: {
    event: _propTypes.default.object,
    onRemove: _propTypes.default.func,
    onClick: _propTypes.default.func
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
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "media",
      onClick: this.onClick,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 37,
        columnNumber: 12
      }
    }, this.props.event.image ? /*#__PURE__*/_react.default.createElement("div", {
      className: "media-left",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 38,
        columnNumber: 34
      }
    }, /*#__PURE__*/_react.default.createElement("a", {
      className: "event-pic",
      href: this.props.event.link || '#',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 39,
        columnNumber: 9
      }
    }, /*#__PURE__*/_react.default.createElement("img", {
      className: "media-object",
      src: this.props.event.image,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 40,
        columnNumber: 11
      }
    }))) : null, this.props.onRemove ? /*#__PURE__*/_react.default.createElement("a", {
      href: "#",
      className: "pull-right remove",
      onClick: this.onRemove,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 44,
        columnNumber: 9
      }
    }, /*#__PURE__*/_react.default.createElement("i", {
      className: "fa fa-trash",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 45,
        columnNumber: 11
      }
    })) : null, /*#__PURE__*/_react.default.createElement("div", {
      className: "media-body",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 48,
        columnNumber: 7
      }
    }, /*#__PURE__*/_react.default.createElement("a", {
      href: this.props.event.link || '#',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 49,
        columnNumber: 9
      }
    }, /*#__PURE__*/_react.default.createElement("h4", {
      className: "media-heading",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 50,
        columnNumber: 11
      }
    }, this.props.event.title), /*#__PURE__*/_react.default.createElement("ul", {
      className: "list-unstyled",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 51,
        columnNumber: 11
      }
    }, /*#__PURE__*/_react.default.createElement("li", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 52,
        columnNumber: 13
      }
    }, this.props.event.location.name, ", ", this.props.event.location.address), /*#__PURE__*/_react.default.createElement("li", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 53,
        columnNumber: 13
      }
    }, this.props.event.dateRange)))));
  }
});
//# sourceMappingURL=EventItem.js.map