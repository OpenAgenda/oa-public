"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _SearchField = _interopRequireDefault(require("@openagenda/react-form-components/build/SearchField"));

var _Spinner = _interopRequireDefault(require("@openagenda/react-components/build/Spinner"));

var _clickTracker = _interopRequireDefault(require("../clickTracker"));

var _EventItem = _interopRequireDefault(require("../components/EventItem"));

var _jsxFileName = "/home/bertho/oa/packages/agenda-event-references/react/src/Editor/Component.js";
var _ = {
  get: require('lodash/get')
};

var Editor = function Editor(props) {
  return _react.default.createElement(EditorComponent, (0, _extends2.default)({}, props, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17
    },
    __self: this
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
    return _react.default.createElement("li", {
      key: event.uid,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 45
      },
      __self: this
    }, _react.default.createElement(_EventItem.default, {
      event: event,
      onClick: onEventAdd,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 46
      },
      __self: this
    }));
  },
  renderDropdown: function renderDropdown(search) {
    var _this = this;

    var getLabel = this.props.getLabel; // the drop down renders when

    if (search.searching) {
      return _react.default.createElement("ul", {
        className: "dropdown-menu",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 59
        },
        __self: this
      }, _react.default.createElement("li", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 60
        },
        __self: this
      }, _react.default.createElement("div", {
        className: "padding-all-lg",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 60
        },
        __self: this
      }, _react.default.createElement(_Spinner.default, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 60
        },
        __self: this
      }))));
    }

    if (search.events !== null && search.events.length) {
      return _react.default.createElement("ul", {
        className: "dropdown-menu",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 67
        },
        __self: this
      }, _react.default.createElement("li", {
        key: "event-section-item",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 68
        },
        __self: this
      }, _react.default.createElement("div", {
        className: "media section-item",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 69
        },
        __self: this
      }, _react.default.createElement("strong", {
        className: "text-muted",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 70
        },
        __self: this
      }, getLabel('searchResultTitle')))), search.events.map(function (event) {
        return _this.renderDropdownItem(event);
      }));
    }

    if (search.suggestions !== null && search.suggestions.length) {
      return _react.default.createElement("ul", {
        className: "dropdown-menu",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 80
        },
        __self: this
      }, _react.default.createElement("li", {
        key: "suggestion-section-item",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 81
        },
        __self: this
      }, _react.default.createElement("div", {
        className: "media section-item",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 82
        },
        __self: this
      }, _react.default.createElement("strong", {
        className: "text-muted",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 83
        },
        __self: this
      }, getLabel('suggestionResultTitle')))), search.suggestions.map(function (event) {
        return _this.renderDropdownItem(event);
      }));
    }

    return _react.default.createElement("ul", {
      className: "dropdown-menu",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 91
      },
      __self: this
    }, _react.default.createElement("li", {
      className: "empty",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 92
      },
      __self: this
    }, _react.default.createElement("p", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 93
      },
      __self: this
    }, getLabel('emptySearch'))));
  },
  render: function render() {
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
    return _react.default.createElement("div", {
      className: "event-references",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 121
      },
      __self: this
    }, _react.default.createElement("div", {
      className: "configure",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 123
      },
      __self: this
    }, _react.default.createElement("label", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 125
      },
      __self: this
    }, getLabel('editorTitle')), info ? _react.default.createElement("div", {
      className: "margin-bottom-sm",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 127
      },
      __self: this
    }, info) : null, _react.default.createElement("ul", {
      className: "list-unstyled references",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 129
      },
      __self: this
    }, loading ? _react.default.createElement(_Spinner.default, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 130
      },
      __self: this
    }) : events.length ? events.map(function (e) {
      return _react.default.createElement("li", {
        key: e.uid,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 131
        },
        __self: this
      }, _react.default.createElement(_EventItem.default, {
        event: e,
        onRemove: onEventRemove,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 131
        },
        __self: this
      }));
    }) : _react.default.createElement("li", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 132
      },
      __self: this
    }, _react.default.createElement("span", {
      className: "empty",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 132
      },
      __self: this
    }, getLabel('emptyReferences')))), search.display ? _react.default.createElement("div", {
      className: displayDropdown ? 'search dropdown open' : 'search dropdown',
      __source: {
        fileName: _jsxFileName,
        lineNumber: 138
      },
      __self: this
    }, _react.default.createElement(_SearchField.default, {
      loading: search.searching,
      threshold: 3,
      value: search.query,
      name: "search",
      label: getLabel('search'),
      placeholder: getLabel('search'),
      onFocus: onSearchFocus,
      onChange: onSearch,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 140
      },
      __self: this
    }), displayDropdown ? this.renderDropdown(search) : null) : _react.default.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 155
      },
      __self: this
    }, _react.default.createElement("a", {
      className: "btn btn-primary margin-right-sm",
      onClick: onShow,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 156
      },
      __self: this
    }, getLabel('addEvent')), suggest ? _react.default.createElement("span", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 157
      },
      __self: this
    }, _react.default.createElement("span", {
      className: "margin-h-sm",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 158
      },
      __self: this
    }, getLabel('addEventOr')), _react.default.createElement("a", {
      disabled: disabledAddSuggestions,
      className: disabledAddSuggestions ? 'btn margin-right-sm text-muted' : 'btn margin-right-sm',
      onClick: onSuggestionsAdd,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 159
      },
      __self: this
    }, getLabel('addEventSuggest'))) : null, loadingSuggestions ? _react.default.createElement(_Spinner.default, {
      mode: "inline",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 164
      },
      __self: this
    }) : null)));
  }
});
var _default = Editor;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=Component.js.map