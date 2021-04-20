"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.search");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _SearchField = _interopRequireDefault(require("@openagenda/react-form-components/build/SearchField"));

var _reactComponents = require("@openagenda/react-components");

var _clickTracker = _interopRequireDefault(require("../clickTracker"));

var _EventItem = _interopRequireDefault(require("../components/EventItem"));

var _this = void 0,
    _jsxFileName = "/home/clement/Project/oa/packages/agenda-event-references/react/src/Editor/Component.js";

var _ = {
  get: require('lodash/get')
};

var Editor = function Editor(props) {
  return /*#__PURE__*/_react.default.createElement(EditorComponent, (0, _extends2.default)({}, props, {
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 3
    }
  }));
};

Editor.propTypes = {
  search: _propTypes.default.object,
  onSearchType: _propTypes.default.func,
  onShow: _propTypes.default.func
};
var EditorComponent = (0, _createReactClass.default)({
  displayName: "EditorComponent",
  componentDidMount: function componentDidMount() {
    _clickTracker.default.switchOn('search');
  },
  componentDidUpdate: function componentDidUpdate() {
    _clickTracker.default.switchOn('search');
  },
  renderDropdownItem: function renderDropdownItem(event) {
    var onEventAdd = this.props.onEventAdd;
    return /*#__PURE__*/_react.default.createElement("li", {
      key: event.uid,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 45,
        columnNumber: 12
      }
    }, /*#__PURE__*/_react.default.createElement(_EventItem.default, {
      event: event,
      onClick: onEventAdd,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 46,
        columnNumber: 7
      }
    }));
  },
  renderDropdown: function renderDropdown(search) {
    var _this2 = this;

    var getLabel = this.props.getLabel; // the drop down renders when

    if (search.searching) {
      return /*#__PURE__*/_react.default.createElement("ul", {
        className: "dropdown-menu",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 59,
          columnNumber: 14
        }
      }, /*#__PURE__*/_react.default.createElement("li", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 60,
          columnNumber: 9
        }
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "padding-all-lg",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 60,
          columnNumber: 13
        }
      }, /*#__PURE__*/_react.default.createElement(_reactComponents.Spinner, {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 60,
          columnNumber: 45
        }
      }))));
    }

    if (search.events !== null && search.events.length) {
      var _context;

      return /*#__PURE__*/_react.default.createElement("ul", {
        className: "dropdown-menu",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 67,
          columnNumber: 14
        }
      }, /*#__PURE__*/_react.default.createElement("li", {
        key: "event-section-item",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 68,
          columnNumber: 9
        }
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "media section-item",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 69,
          columnNumber: 11
        }
      }, /*#__PURE__*/_react.default.createElement("strong", {
        className: "text-muted",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 70,
          columnNumber: 13
        }
      }, getLabel('searchResultTitle')))), (0, _map.default)(_context = search.events).call(_context, function (event) {
        return _this2.renderDropdownItem(event);
      }));
    }

    if (search.suggestions !== null && search.suggestions.length) {
      var _context2;

      return /*#__PURE__*/_react.default.createElement("ul", {
        className: "dropdown-menu",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 80,
          columnNumber: 14
        }
      }, /*#__PURE__*/_react.default.createElement("li", {
        key: "suggestion-section-item",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 81,
          columnNumber: 9
        }
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "media section-item",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 82,
          columnNumber: 11
        }
      }, /*#__PURE__*/_react.default.createElement("strong", {
        className: "text-muted",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 83,
          columnNumber: 13
        }
      }, getLabel('suggestionResultTitle')))), (0, _map.default)(_context2 = search.suggestions).call(_context2, function (event) {
        return _this2.renderDropdownItem(event);
      }));
    }

    return /*#__PURE__*/_react.default.createElement("ul", {
      className: "dropdown-menu",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 91,
        columnNumber: 12
      }
    }, /*#__PURE__*/_react.default.createElement("li", {
      className: "empty",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 92,
        columnNumber: 7
      }
    }, /*#__PURE__*/_react.default.createElement("p", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 93,
        columnNumber: 9
      }
    }, getLabel('emptySearch'))));
  },
  render: function render() {
    var _this3 = this;

    var _this$props = this.props,
        onShow = _this$props.onShow,
        onSearch = _this$props.onSearch,
        onSearchFocus = _this$props.onSearchFocus,
        onEventRemove = _this$props.onEventRemove,
        onEventAdd = _this$props.onEventAdd,
        onSuggestionsAdd = _this$props.onSuggestionsAdd,
        search = _this$props.search,
        events = _this$props.events,
        loading = _this$props.loading,
        getLabel = _this$props.getLabel,
        info = _this$props.info,
        suggest = _this$props.suggest,
        loadingSuggestions = _this$props.loadingSuggestions;
    var disabledAddSuggestions = loadingSuggestions || search.suggestions && !search.suggestions.length;
    var displayDropdown = search.query && search.query.length || suggest && search.suggestions !== null && search.suggestions.length;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "event-references",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 121,
        columnNumber: 12
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "configure",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 123,
        columnNumber: 7
      }
    }, /*#__PURE__*/_react.default.createElement("label", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 125,
        columnNumber: 9
      }
    }, getLabel('editorTitle')), info ? /*#__PURE__*/_react.default.createElement("div", {
      className: "margin-bottom-sm",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 127,
        columnNumber: 18
      }
    }, info) : null, /*#__PURE__*/_react.default.createElement("ul", {
      className: "list-unstyled references",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 129,
        columnNumber: 9
      }
    }, loading ? /*#__PURE__*/_react.default.createElement(_reactComponents.Spinner, {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 130,
        columnNumber: 23
      }
    }) : events.length ? (0, _map.default)(events).call(events, function (e) {
      return /*#__PURE__*/_react.default.createElement("li", {
        key: e.uid,
        __self: _this3,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 131,
          columnNumber: 46
        }
      }, /*#__PURE__*/_react.default.createElement(_EventItem.default, {
        event: e,
        onRemove: onEventRemove,
        __self: _this3,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 131,
          columnNumber: 62
        }
      }));
    }) : /*#__PURE__*/_react.default.createElement("li", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 132,
        columnNumber: 15
      }
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "empty",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 132,
        columnNumber: 19
      }
    }, getLabel('emptyReferences')))), search.display ? /*#__PURE__*/_react.default.createElement("div", {
      className: displayDropdown ? 'search dropdown open' : 'search dropdown',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 138,
        columnNumber: 13
      }
    }, /*#__PURE__*/_react.default.createElement(_SearchField.default, {
      loading: search.searching,
      threshold: 3,
      value: search.query,
      name: "search",
      label: getLabel('search'),
      placeholder: getLabel('search'),
      onFocus: onSearchFocus,
      onChange: onSearch,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 140,
        columnNumber: 15
      }
    }), displayDropdown ? this.renderDropdown(search) : null) : /*#__PURE__*/_react.default.createElement("div", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 155,
        columnNumber: 11
      }
    }, /*#__PURE__*/_react.default.createElement("a", {
      className: "btn btn-primary margin-right-sm",
      onClick: onShow,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 156,
        columnNumber: 11
      }
    }, getLabel('addEvent')), suggest ? /*#__PURE__*/_react.default.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 157,
        columnNumber: 23
      }
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "margin-h-sm",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 158,
        columnNumber: 13
      }
    }, getLabel('addEventOr')), /*#__PURE__*/_react.default.createElement("a", {
      disabled: disabledAddSuggestions,
      className: disabledAddSuggestions ? 'btn margin-right-sm text-muted' : 'btn margin-right-sm',
      onClick: onSuggestionsAdd,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 159,
        columnNumber: 13
      }
    }, getLabel('addEventSuggest'))) : null, loadingSuggestions ? /*#__PURE__*/_react.default.createElement(_reactComponents.Spinner, {
      mode: "inline",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 164,
        columnNumber: 34
      }
    }) : null)));
  }
});
var _default = Editor;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=Component.js.map