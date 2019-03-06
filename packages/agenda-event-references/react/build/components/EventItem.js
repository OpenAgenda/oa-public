"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _jsxFileName = "/home/bertho/oa/packages/agenda-event-references/react/src/components/EventItem.js";
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
    return _react.default.createElement("div", {
      className: "media",
      onClick: this.onClick,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 37
      },
      __self: this
    }, this.props.event.image ? _react.default.createElement("div", {
      className: "media-left",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 38
      },
      __self: this
    }, _react.default.createElement("a", {
      className: "event-pic",
      href: this.props.event.link || '#',
      __source: {
        fileName: _jsxFileName,
        lineNumber: 39
      },
      __self: this
    }, _react.default.createElement("img", {
      className: "media-object",
      src: this.props.event.image,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 40
      },
      __self: this
    }))) : null, this.props.onRemove ? _react.default.createElement("a", {
      href: "#",
      className: "pull-right remove",
      onClick: this.onRemove,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 44
      },
      __self: this
    }, _react.default.createElement("i", {
      className: "fa fa-trash",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 45
      },
      __self: this
    })) : null, _react.default.createElement("div", {
      className: "media-body",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 48
      },
      __self: this
    }, _react.default.createElement("a", {
      href: this.props.event.link || '#',
      __source: {
        fileName: _jsxFileName,
        lineNumber: 49
      },
      __self: this
    }, _react.default.createElement("h4", {
      className: "media-heading",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 50
      },
      __self: this
    }, this.props.event.title), _react.default.createElement("ul", {
      className: "list-unstyled",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 51
      },
      __self: this
    }, _react.default.createElement("li", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 52
      },
      __self: this
    }, this.props.event.location.name, ", ", this.props.event.location.address), _react.default.createElement("li", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 53
      },
      __self: this
    }, this.props.event.dateRange)))));
  }
});
//# sourceMappingURL=EventItem.js.map