import _first from "lodash/first.js";
import _get from "lodash/get.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/Languages.js",
  _context;
import _sortInstanceProperty from "@babel/runtime-corejs3/core-js/instance/sort";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import languages from 'languages';
import { Component } from 'react';
import Select from 'react-select';
import flattenLabels from '@openagenda/labels/flatten.js';
import languageLabels from '@openagenda/labels/event/form.js';
import { a11yButtonActionHandler } from '@openagenda/react-shared';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const languageCodesAndLabels = _sortInstanceProperty(_context = languages.getAllLanguageCode().map(c => ({
  value: c,
  label: languages.getLanguageInfo(c).nativeName
}))).call(_context, (a, b) => a.label < b.label ? -1 : 1);
export default class Languages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adding: false,
      changing: false
    };
    this.onAddSelectStart = this.onAddSelectStart.bind(this);
    this.onChangeStart = this.onChangeStart.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCancelChange = this.onCancelChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.getRemainingLanguages = this.getRemainingLanguages.bind(this);
  }
  onAddSelectStart() {
    this.setState({
      adding: true
    });
  }
  onChangeStart() {
    const {
      value
    } = this.props;
    if (value.length !== 1) return;
    this.setState({
      changing: true
    });
  }
  onChange(l) {
    const {
      onChange
    } = this.props;
    onChange([l.value]);
    this.setState({
      changing: false
    });
  }
  onCancelChange() {
    this.setState({
      changing: false
    });
  }
  onRemove(l) {
    const {
      value,
      onChange
    } = this.props;
    onChange(value.filter(current => current !== l));
  }
  onAdd(l) {
    const {
      value,
      onChange
    } = this.props;
    onChange(value.concat(l.value));
    this.setState({
      adding: false
    });
  }
  getRemainingLanguages() {
    const {
      value
    } = this.props;
    return languageCodesAndLabels.filter(l => !_includesInstanceProperty(value).call(value, l.value));
  }
  render() {
    const {
      value: pickedLanguages,
      lang
    } = this.props;
    const {
      adding,
      changing
    } = this.state;
    const labels = flattenLabels(languageLabels, lang);
    const className = _get(this.props, 'className', 'language-bar');
    return /*#__PURE__*/_jsxDEV("div", {
      className: className,
      children: [!changing ? /*#__PURE__*/_jsxDEV("ul", {
        children: pickedLanguages.map(l => /*#__PURE__*/_jsxDEV("li", {
          role: "presentation",
          onClick: a11yButtonActionHandler(this.onChangeStart),
          onKeyPress: a11yButtonActionHandler(this.onChangeStart),
          children: /*#__PURE__*/_jsxDEV("div", {
            className: "language-item",
            children: [/*#__PURE__*/_jsxDEV("span", {
              children: languages.getLanguageInfo(l).nativeName
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 88,
              columnNumber: 19
            }, this), pickedLanguages.length > 1 ? /*#__PURE__*/_jsxDEV("span", {
              className: "remove",
              role: "button",
              tabIndex: "0",
              onClick: a11yButtonActionHandler(() => this.onRemove(l)),
              onKeyPress: a11yButtonActionHandler(() => this.onRemove(l)),
              children: "\u2715"
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 90,
              columnNumber: 21
            }, this) : null, pickedLanguages.length === 1 ? /*#__PURE__*/_jsxDEV("span", {
              className: "margin-right-xs",
              children: /*#__PURE__*/_jsxDEV("i", {
                className: "fa fa-angle-down"
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 103,
                columnNumber: 23
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 102,
              columnNumber: 21
            }, this) : null]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 87,
            columnNumber: 17
          }, this)
        }, "language-".concat(l), false, {
          fileName: _jsxFileName,
          lineNumber: 81,
          columnNumber: 15
        }, this))
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 79,
        columnNumber: 11
      }, this) : null, !adding && !changing ? /*#__PURE__*/_jsxDEV("span", {
        className: "language-add",
        children: /*#__PURE__*/_jsxDEV("a", {
          onClick: this.onAddSelectStart,
          children: labels.addLanguage
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 114,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 112,
        columnNumber: 11
      }, this) : null, adding && /*#__PURE__*/_jsxDEV("span", {
        className: "language-add",
        children: /*#__PURE__*/_jsxDEV(Select, {
          options: this.getRemainingLanguages(),
          onChange: this.onAdd,
          clearable: false,
          menuPosition: "fixed"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 119,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 118,
        columnNumber: 11
      }, this), changing && /*#__PURE__*/_jsxDEV(Select, {
        value: _first(languageCodesAndLabels.filter(c => _first(pickedLanguages) === c.value)),
        options: this.getRemainingLanguages(),
        onChange: this.onChange,
        className: "change-select margin-right-sm",
        clearable: false
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 128,
        columnNumber: 11
      }, this), changing ? /*#__PURE__*/_jsxDEV("span", {
        className: "change-cancel",
        children: /*#__PURE__*/_jsxDEV("a", {
          onClick: this.onCancelChange,
          children: labels.cancelLanguageChange
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 143,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 141,
        columnNumber: 11
      }, this) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 77,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=Languages.js.map