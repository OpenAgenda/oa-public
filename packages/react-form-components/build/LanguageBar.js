"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

require("core-js/modules/es6.array.sort");

var _react = _interopRequireDefault(require("react"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languages = _interopRequireDefault(require("languages"));

var _reactSelect = _interopRequireDefault(require("react-select"));

var _labels = _interopRequireDefault(require("../labels"));

var _makeLabelGetter = _interopRequireDefault(require("../lib/makeLabelGetter"));

var _jsxFileName = "/home/bertho/oa/packages/react-form-components/components/LanguageBar.jsx";
module.exports = (0, _createReactClass.default)({
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
  getInitialState: function getInitialState() {
    return {
      displaySelect: false,
      sortedLanguageCodes: this.sortLanguageCodes(),
      edited: false
    };
  },
  getDefaultProps: function getDefaultProps() {
    return {
      editable: true,
      getLabel: (0, _makeLabelGetter.default)(_labels.default)
    };
  },
  onRemove: function onRemove(code) {
    this.props.onChange(this.props.languages.filter(function (l) {
      return l !== code;
    }));
  },
  isEnabled: function isEnabled(lang) {
    if (!this.props.enabled) return true;
    return this.props.enabled.indexOf(lang) !== -1;
  },
  sortLanguageCodes: function sortLanguageCodes() {
    return _languages.default.getAllLanguageCode().map(function (c) {
      return {
        code: c,
        label: _languages.default.getLanguageInfo(c).nativeName
      };
    }).sort(function (a, b) {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    }).map(function (a) {
      return a.code;
    });
  },
  getRemainingLanguages: function getRemainingLanguages() {
    var _this = this;

    var self = this;
    return this.state.sortedLanguageCodes.filter(function (c) {
      return _this.props.languages.indexOf(c) == -1;
    }).map(function (c) {
      return {
        value: c,
        label: _languages.default.getLanguageInfo(c).nativeName
      };
    });
  },
  showSelect: function showSelect() {
    this.setState({
      displaySelect: true
    });
  },
  hideSelect: function hideSelect() {
    this.setState({
      displaySelect: false
    });
  },
  languageAdd: function languageAdd(newCode) {
    var languages = this.props.languages.slice();
    languages.push(newCode.value);
    this.hideSelect();
    this.props.onChange(languages);
  },
  languageEdit: function languageEdit(code) {
    this.setState({
      edited: code
    });
  },
  languageChange: function languageChange(previousCode, newCode) {
    var languages = this.props.languages.slice();
    languages.splice(languages.indexOf(previousCode), 1, newCode);
    this.setState({
      edited: false
    });
    this.props.onChange(languages);
  },
  render: function render() {
    var _this2 = this;

    var languageItem = function languageItem(l) {
      return _react.default.createElement(LanguageItem, {
        enabled: _this2.isEnabled(l),
        editable: _this2.props.editable,
        code: l,
        key: l,
        edited: l == _this2.state.edited,
        languages: _this2.props.languages,
        getRemainingLanguages: _this2.getRemainingLanguages,
        onRemove: _this2.onRemove,
        onChange: _this2.languageChange,
        onEdit: _this2.languageEdit.bind(null, l),
        __source: {
          fileName: _jsxFileName,
          lineNumber: 161
        },
        __self: this
      });
    };

    return _react.default.createElement("div", {
      className: "language-bar",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 176
      },
      __self: this
    }, _react.default.createElement("ul", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 177
      },
      __self: this
    }, this.props.languages.map(function (l) {
      return languageItem(l);
    })), this.props.editable ? _react.default.createElement("span", {
      className: "language-add cform",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 180
      },
      __self: this
    }, this.state.displaySelect ? _react.default.createElement(_reactSelect.default, {
      options: this.getRemainingLanguages(),
      onChange: this.languageAdd,
      clearable: false,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 181
      },
      __self: this
    }) : _react.default.createElement("a", {
      className: "url",
      onClick: this.showSelect,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 184
      },
      __self: this
    }, this.props.getLabel('addLanguage'))) : null);
  }
});
var LanguageItem = (0, _createReactClass.default)({
  displayName: "LanguageItem",
  onRemove: function onRemove() {
    if (!this.props.editable) return;
    this.props.onRemove(this.props.code);
  },
  getDefaultProps: function getDefaultProps() {
    return {
      enabled: true,
      editable: true
    };
  },
  renderCross: function renderCross() {
    return _react.default.createElement("span", {
      onClick: this.onRemove,
      className: "remove",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 215
      },
      __self: this
    }, "\u2715");
  },
  onChange: function onChange(language) {
    this.props.onChange(this.props.code, language.value);
  },
  render: function render() {
    var lInfo = _languages.default.getLanguageInfo(this.props.code);

    if (this.props.edited) {
      return _react.default.createElement("li", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 231
        },
        __self: this
      }, _react.default.createElement(_reactSelect.default, {
        value: lInfo.nativeName,
        options: this.props.getRemainingLanguages(),
        onChange: this.onChange,
        clearable: false,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 232
        },
        __self: this
      }));
    } else {
      return _react.default.createElement("li", {
        className: this.props.enabled ? '' : 'disabled',
        __source: {
          fileName: _jsxFileName,
          lineNumber: 241
        },
        __self: this
      }, _react.default.createElement("div", {
        className: "language-item",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 242
        },
        __self: this
      }, _react.default.createElement("span", {
        onClick: this.props.onEdit,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 243
        },
        __self: this
      }, lInfo.nativeName), this.props.languages.length > 1 && this.props.editable ? this.renderCross() : null));
    }

    return _react.default.createElement("li", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 250
      },
      __self: this
    }, this.props.edited ? 'edited' : _react.default.createElement("span", {
      onClick: this.props.onEdit,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 252
      },
      __self: this
    }, lInfo.nativeName), this.props.languages.length > 1 ? this.renderCross() : null);
  }
});
//# sourceMappingURL=LanguageBar.js.map