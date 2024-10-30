"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sort = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/sort"));
var _react = _interopRequireDefault(require("react"));
var _createReactClass = _interopRequireDefault(require("create-react-class"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _languages = _interopRequireDefault(require("languages"));
var _reactSelect = _interopRequireDefault(require("react-select"));
var _labels = _interopRequireDefault(require("../labels"));
var _makeLabelGetter = _interopRequireDefault(require("../lib/makeLabelGetter"));
var _jsxDevRuntime = require("react/jsx-dev-runtime");
var _jsxFileName = "/home/clement/Project/oa/packages/react-form-components/components/LanguageBar.jsx";
var _default = exports.default = (0, _createReactClass.default)({
  displayName: 'LanguageBar',
  propTypes: {
    enabled: _propTypes.default.array,
    // if languages can be added removed or changed
    editable: _propTypes.default.bool,
    // used by component to load labels
    getLabel: _propTypes.default.func,
    // notify parent of new language selection
    onChange: _propTypes.default.func
  },
  getInitialState() {
    return {
      displaySelect: false,
      sortedLanguageCodes: this.sortLanguageCodes(),
      edited: false
    };
  },
  getDefaultProps() {
    return {
      editable: true,
      getLabel: (0, _makeLabelGetter.default)(_labels.default)
    };
  },
  onRemove(code) {
    this.props.onChange(this.props.languages.filter(function (l) {
      return l !== code;
    }));
  },
  isEnabled(lang) {
    if (!this.props.enabled) return true;
    return this.props.enabled.indexOf(lang) !== -1;
  },
  sortLanguageCodes() {
    var _context;
    return (0, _sort.default)(_context = _languages.default.getAllLanguageCode().map(function (c) {
      return {
        code: c,
        label: _languages.default.getLanguageInfo(c).nativeName
      };
    })).call(_context, function (a, b) {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    }).map(function (a) {
      return a.code;
    });
  },
  getRemainingLanguages() {
    var self = this;
    return this.state.sortedLanguageCodes.filter(c => this.props.languages.indexOf(c) == -1).map(function (c) {
      return {
        value: c,
        label: _languages.default.getLanguageInfo(c).nativeName
      };
    });
  },
  showSelect() {
    this.setState({
      displaySelect: true
    });
  },
  hideSelect() {
    this.setState({
      displaySelect: false
    });
  },
  languageAdd(newCode) {
    var languages = this.props.languages.slice();
    languages.push(newCode.value);
    this.hideSelect();
    this.props.onChange(languages);
  },
  languageEdit(code) {
    this.setState({
      edited: code
    });
  },
  languageChange(previousCode, newCode) {
    var languages = this.props.languages.slice();
    languages.splice(languages.indexOf(previousCode), 1, newCode);
    this.setState({
      edited: false
    });
    this.props.onChange(languages);
  },
  render() {
    let languageItem = l => {
      return /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)(LanguageItem, {
        enabled: this.isEnabled(l),
        editable: this.props.editable,
        code: l,
        edited: l == this.state.edited,
        languages: this.props.languages,
        getRemainingLanguages: this.getRemainingLanguages,
        onRemove: this.onRemove,
        onChange: this.languageChange,
        onEdit: this.languageEdit.bind(null, l)
      }, l, false, {
        fileName: _jsxFileName,
        lineNumber: 129,
        columnNumber: 9
      }, this);
    };
    return /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("div", {
      className: "language-bar",
      children: [/*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("ul", {
        children: this.props.languages.map(l => {
          return languageItem(l);
        })
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 146,
        columnNumber: 9
      }, this), this.props.editable ? /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("span", {
        className: "language-add cform",
        children: this.state.displaySelect ? /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)(_reactSelect.default, {
          options: this.getRemainingLanguages(),
          onChange: this.languageAdd,
          clearable: false
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 154,
          columnNumber: 15
        }, this) : /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("a", {
          className: "url",
          onClick: this.showSelect,
          children: this.props.getLabel('addLanguage')
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 160,
          columnNumber: 15
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 152,
        columnNumber: 11
      }, this) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 145,
      columnNumber: 7
    }, this);
  }
});
var LanguageItem = (0, _createReactClass.default)({
  displayName: "LanguageItem",
  onRemove: function () {
    if (!this.props.editable) return;
    this.props.onRemove(this.props.code);
  },
  getDefaultProps() {
    return {
      enabled: true,
      editable: true
    };
  },
  renderCross() {
    return /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("span", {
      onClick: this.onRemove,
      className: "remove",
      children: "\u2715"
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 187,
      columnNumber: 7
    }, this);
  },
  onChange: function (language) {
    this.props.onChange(this.props.code, language.value);
  },
  render: function () {
    let lInfo = _languages.default.getLanguageInfo(this.props.code);
    if (this.props.edited) {
      return /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("li", {
        children: /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)(_reactSelect.default, {
          value: lInfo.nativeName,
          options: this.props.getRemainingLanguages(),
          onChange: this.onChange,
          clearable: false,
          className: "change-select"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 203,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 202,
        columnNumber: 9
      }, this);
    } else {
      return /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("li", {
        className: this.props.enabled ? '' : 'disabled',
        children: /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("div", {
          className: "language-item",
          children: [/*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("span", {
            onClick: this.props.onEdit,
            children: lInfo.nativeName
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 216,
            columnNumber: 13
          }, this), this.props.languages.length > 1 && this.props.editable ? this.renderCross() : null]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 215,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 214,
        columnNumber: 9
      }, this);
    }
    return /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("li", {
      children: [this.props.edited ? 'edited' : /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("span", {
        onClick: this.props.onEdit,
        children: lInfo.nativeName
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 230,
        columnNumber: 11
      }, this), this.props.languages.length > 1 ? this.renderCross() : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 226,
      columnNumber: 7
    }, this);
  }
});
module.exports = exports.default;
//# sourceMappingURL=LanguageBar.js.map