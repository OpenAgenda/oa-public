import _toUpper from "lodash/toUpper.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/LabelLanguages.js";
import { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import { Modal } from '@openagenda/react-shared';
import Languages from '../Components/Languages.js';
import labels from './lib/labels.js';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(labels);
export default class LabelLanguages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editedLanguages: null
    };
  }
  onEdit(e) {
    e.preventDefault();
    const {
      labelLanguages
    } = this.props;
    this.setState({
      editedLanguages: labelLanguages
    });
  }
  applyLanguages() {
    let languages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    const {
      onUpdate
    } = this.props;
    onUpdate(languages);
    this.setState({
      editedLanguages: null
    });
  }
  renderEdit() {
    const {
      lang
    } = this.props;
    const {
      editedLanguages
    } = this.state;
    return /*#__PURE__*/_jsxDEV("div", {
      children: editedLanguages.length ? /*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("p", {
          children: getLabel('editLabelLanguagesInfo', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 50,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV(Languages, {
          className: "language-bar thin",
          lang: lang,
          value: editedLanguages,
          onChange: editedLanguagesUpdate => this.setState({
            editedLanguages: editedLanguagesUpdate
          })
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 51,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "padding-top-md",
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-primary",
            onClick: () => this.applyLanguages(editedLanguages),
            children: getLabel('submitLabelLanguages', lang)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 61,
            columnNumber: 15
          }, this), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-danger pull-right",
            onClick: () => this.applyLanguages(),
            children: getLabel('removeLabelLanguages', lang)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 68,
            columnNumber: 15
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 60,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 49,
        columnNumber: 11
      }, this) : /*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("p", {
          children: getLabel('monolingualLabels', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 79,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-primary",
          onClick: () => this.setState({
            editedLanguages: [lang]
          }),
          children: getLabel('addLabelLanguages', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 80,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 78,
        columnNumber: 11
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 47,
      columnNumber: 7
    }, this);
  }
  render() {
    const {
      labelLanguages,
      lang,
      disabled
    } = this.props;
    const {
      editedLanguages
    } = this.state;
    return /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "margin-bottom-sm",
        children: [/*#__PURE__*/_jsxDEV("label", {
          htmlFor: "language-list",
          className: "margin-right-xs margin-top-xs pull-left",
          children: getLabel('multilingualLabels', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 99,
          columnNumber: 11
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "margin-v-xs pull-left",
          id: "language-list",
          children: labelLanguages.length ? labelLanguages.map(l => /*#__PURE__*/_jsxDEV("span", {
            className: "badge badge-default margin-right-xs",
            children: _toUpper(l)
          }, "field-lang-".concat(l), false, {
            fileName: _jsxFileName,
            lineNumber: 108,
            columnNumber: 17
          }, this)) : null
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 105,
          columnNumber: 11
        }, this), labelLanguages.length ? /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          disabled: disabled,
          className: "btn btn-link",
          onClick: this.onEdit.bind(this),
          children: getLabel('editLabelLanguages', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 118,
          columnNumber: 13
        }, this) : /*#__PURE__*/_jsxDEV("button", {
          className: "btn btn-link",
          type: "button",
          disabled: disabled,
          onClick: this.onEdit.bind(this),
          children: getLabel('monolingualLabels', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 127,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 98,
        columnNumber: 9
      }, this), editedLanguages ? /*#__PURE__*/_jsxDEV(Modal, {
        title: getLabel('editLabelLanguages', lang),
        onClose: () => this.setState({
          editedLanguages: null
        }),
        children: this.renderEdit()
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 138,
        columnNumber: 11
      }, this) : null]
    }, void 0, true);
  }
}
//# sourceMappingURL=LabelLanguages.js.map