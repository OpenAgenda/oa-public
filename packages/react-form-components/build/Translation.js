"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languages = _interopRequireDefault(require("languages"));

var _reactSelect = _interopRequireDefault(require("react-select"));

var _jsxFileName = "/home/bertho/oa/packages/react-form-components/components/Translation.jsx";

var Translation = function Translation(props) {
  return _react.default.createElement(TranslationComponent, (0, _extends2.default)({}, props, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 9
    },
    __self: this
  }));
};

var _default = Translation;
exports.default = _default;
Translation.propTypes = {
  source: _propTypes.default.string,
  languages: _propTypes.default.array,
  labels: _propTypes.default.object,
  checked: _propTypes.default.array,
  check: _propTypes.default.func,
  uncheck: _propTypes.default.func,
  helpLink: _propTypes.default.string
};
var TranslationComponent = (0, _createReactClass.default)({
  displayName: "TranslationComponent",
  getDefaultProps: function getDefaultProps() {
    return {
      source: 'fr',
      sets: [{
        source: 'fr',
        target: ['de', 'en', 'es', 'it'],
        checked: []
      }],
      labels: {
        translationTitle: 'Translation',
        sourceLanguage: 'Source Language',
        targetLanguages: 'Automatic translation',
        translationHelp: 'Find out more',
        sourceChange: 'Choose',
        info: null
      },
      helpLink: 'https://openagenda.zendesk.com/hc/fr/articles/213573709-Traduction-automatique-des-%C3%A9v%C3%A9nements',
      check: function check() {},
      uncheck: function uncheck() {},
      sourceChange: function sourceChange() {}
    };
  },
  getInitialState: function getInitialState() {
    return {
      editingSource: false
    };
  },
  sourceChange: function sourceChange(e) {
    e.preventDefault();
    this.setState({
      editingSource: true
    });
  },
  updateSource: function updateSource(newSource) {
    this.setState({
      editingSource: false
    });
    this.props.sourceChange(newSource.value);
  },
  render: function render() {
    var _this = this;

    var labels = this.props.labels;
    return _react.default.createElement("div", {
      className: "form-group translation-form",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 83
      },
      __self: this
    }, _react.default.createElement("a", {
      className: "pull-right help",
      target: "_blank",
      href: this.props.helpLink,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 84
      },
      __self: this
    }, _react.default.createElement("i", {
      className: "fa fa-question-circle",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 85
      },
      __self: this
    }), _react.default.createElement("label", {
      style: {
        display: 'none'
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 86
      },
      __self: this
    }, labels.translationHelp)), _react.default.createElement("label", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 88
      },
      __self: this
    }, labels.translationTitle), labels.info ? _react.default.createElement("div", {
      className: "margin-bottom-sm",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 89
      },
      __self: this
    }, labels.info) : null, _react.default.createElement("div", {
      className: "form-inline row",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 90
      },
      __self: this
    }, _react.default.createElement("div", {
      className: "col-sm-6",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 91
      },
      __self: this
    }, _react.default.createElement("label", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 92
      },
      __self: this
    }, labels.sourceLanguage), this.state.editingSource ? _react.default.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 94
      },
      __self: this
    }, _react.default.createElement(_reactSelect.default, {
      value: this.props.source,
      options: this.props.sets.map(function (s) {
        return {
          value: s.source,
          label: _languages.default.getLanguageInfo(s.source).nativeName
        };
      }),
      onChange: this.updateSource,
      clearable: false,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 95
      },
      __self: this
    })) : _react.default.createElement("div", {
      className: "line",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 104
      },
      __self: this
    }, _react.default.createElement("span", {
      className: "disabled",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 105
      },
      __self: this
    }, _languages.default.getLanguageInfo(this.props.source).nativeName), this.props.sets.length > 1 ? _react.default.createElement("span", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 107
      },
      __self: this
    }, " - ", _react.default.createElement("a", {
      href: "#",
      onClick: this.sourceChange,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 107
      },
      __self: this
    }, labels.sourceChange)) : null)), _react.default.createElement("div", {
      className: "col-sm-6",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 110
      },
      __self: this
    }, _react.default.createElement("label", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 111
      },
      __self: this
    }, labels.targetLanguages), _react.default.createElement("ul", {
      className: "list-unstyled line",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 112
      },
      __self: this
    }, this.props.sets.filter(function (s) {
      return s.source === _this.props.source;
    }).map(function (s) {
      return s.target.map(function (l) {
        return _react.default.createElement("li", {
          key: l,
          className: "checkbox margin-right-sm",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 114
          },
          __self: this
        }, _react.default.createElement("label", {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 115
          },
          __self: this
        }, _react.default.createElement("input", {
          type: "checkbox",
          onChange: function onChange(e) {
            return s.checked.indexOf(l) !== -1 ? _this.props.uncheck(s.source, l) : _this.props.check(s.source, l);
          },
          checked: s.checked.indexOf(l) !== -1,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 116
          },
          __self: this
        }), l.toUpperCase()));
      });
    })))));
  }
});
module.exports = exports["default"];
//# sourceMappingURL=Translation.js.map