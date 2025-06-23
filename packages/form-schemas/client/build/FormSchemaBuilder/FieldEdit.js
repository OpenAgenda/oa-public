var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/FieldEdit.js";
import { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import { Modal } from '@openagenda/react-shared';
import FieldForm from './FieldForm.js';
import labels from './lib/labels.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(labels);
export default class FieldEdit extends Component {
  onSubmit(values) {
    const {
      onSave
    } = this.props;
    onSave(values);
  }
  render() {
    const {
      field,
      lang,
      labelLanguages,
      onCancel,
      customFieldConfigurationSchemas,
      components,
      parentsFields
    } = this.props;
    return /*#__PURE__*/_jsxDEV(Modal, {
      classNames: {
        overlay: 'popup-overlay big'
      },
      onClose: onCancel,
      children: /*#__PURE__*/_jsxDEV(FieldForm, {
        lang: lang,
        labelLanguages: labelLanguages,
        field: field,
        onSubmit: v => this.onSubmit(v),
        actionComponent: _ref => {
          let {
            onSubmit
          } = _ref;
          return /*#__PURE__*/_jsxDEV("div", {
            children: [/*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: "btn btn-default",
              onClick: onCancel,
              children: getLabel('cancelFieldEdit', lang)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 37,
              columnNumber: 15
            }, this), /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: "btn btn-primary pull-right",
              onClick: onSubmit,
              children: getLabel('confirmFieldUpdate', lang)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 44,
              columnNumber: 15
            }, this)]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 36,
            columnNumber: 13
          }, this);
        },
        customFieldConfigurationSchemas: customFieldConfigurationSchemas,
        components: components,
        parentsField: parentsFields.fields.find(e => e.field === field.field)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=FieldEdit.js.map