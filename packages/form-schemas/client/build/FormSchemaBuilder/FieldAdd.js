var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/FieldAdd.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import { useState, useCallback } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import { Modal } from '@openagenda/react-shared';
import ChooseFieldType from './ChooseFieldType.js';
import FieldForm from './FieldForm.js';
import labels from './lib/labels.js';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(labels);
const Canvas = _ref => {
  let {
    children,
    modal,
    onClose,
    title
  } = _ref;
  return modal ? /*#__PURE__*/_jsxDEV(Modal, {
    classNames: {
      overlay: 'popup-overlay big'
    },
    onClose: () => onClose(),
    title: title,
    children: children
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 13,
    columnNumber: 5
  }, this) : /*#__PURE__*/_jsxDEV(_Fragment, {
    children: [/*#__PURE__*/_jsxDEV("h3", {
      className: "margin-v-sm",
      children: title
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 7
    }, this), children]
  }, void 0, true);
};
const isDuplicateLabel = (schema, field) => {
  var _context;
  if (field.type === 'section') {
    return false;
  }
  const fieldLabels = typeof field.label === 'string' ? [field.label] : Object.values(field.label);
  return !!_reduceInstanceProperty(_context = schema.fields).call(_context, (existingLabels, schemaField) => existingLabels.concat(typeof schemaField.label === 'string' ? [schemaField.label] : Object.values(schemaField.label)), []).filter(label => _includesInstanceProperty(fieldLabels).call(fieldLabels, label)).length;
};
const ErrorSummary = _ref2 => {
  let {
    errors
  } = _ref2;
  return /*#__PURE__*/_jsxDEV("div", {
    className: "error-summary boxed margin-top-sm padding-h-sm padding-v-xs",
    children: errors.map(e => e.label).join(', ')
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 48,
    columnNumber: 3
  }, this);
};
const DisabledFieldForm = _ref3 => {
  let {
    lang
  } = _ref3;
  return /*#__PURE__*/_jsxDEV(FieldForm, {
    enable: false,
    initFieldType: "text",
    onSubmit: () => {},
    lang: lang,
    labelLanguages: [],
    actionComponent: () => null
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 54,
    columnNumber: 3
  }, this);
};
export default function FieldAdd(_ref4) {
  let {
    onAdd: propsOnAdd,
    schema,
    onClose,
    lang,
    modal = true,
    labelLanguages
  } = _ref4;
  const [fieldType, setFieldType] = useState(null);
  const [errors, setErrors] = useState([]);
  const onAdd = useCallback(field => {
    // slug is not defined here: it cannot be used as a basis for duplicate detection
    if (isDuplicateLabel(schema, field)) {
      setErrors([{
        label: getLabel('isLabelDuplicateError', lang)
      }]);
      return;
    }
    setErrors([]);
    propsOnAdd(field);
  }, [schema, propsOnAdd, setErrors, lang]);
  return /*#__PURE__*/_jsxDEV(Canvas, {
    modal: modal,
    onClose: onClose,
    title: getLabel('addField', lang),
    children: [/*#__PURE__*/_jsxDEV(ChooseFieldType, {
      lang: lang,
      value: fieldType,
      onChange: setFieldType,
      onCancel: onClose
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 94,
      columnNumber: 7
    }, this), fieldType ? /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [errors.length ? /*#__PURE__*/_jsxDEV(ErrorSummary, {
        errors: errors,
        lang: lang
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 102,
        columnNumber: 28
      }, this) : null, /*#__PURE__*/_jsxDEV(FieldForm, {
        initFieldType: fieldType,
        onSubmit: onAdd,
        lang: lang,
        labelLanguages: labelLanguages,
        actionComponent: _ref5 => {
          let {
            onSubmit
          } = _ref5;
          return /*#__PURE__*/_jsxDEV(_Fragment, {
            children: [errors.length ? /*#__PURE__*/_jsxDEV("div", {
              className: "margin-bottom-md",
              children: /*#__PURE__*/_jsxDEV(ErrorSummary, {
                errors: errors,
                lang: lang
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 112,
                columnNumber: 21
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 111,
              columnNumber: 19
            }, this) : null, /*#__PURE__*/_jsxDEV("div", {
              children: [/*#__PURE__*/_jsxDEV("button", {
                type: "button",
                className: "btn btn-default",
                onClick: () => onClose(),
                children: getLabel('cancelFieldEdit', lang)
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 116,
                columnNumber: 19
              }, this), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                className: "btn btn-primary pull-right",
                onClick: onSubmit,
                children: getLabel('confirmFieldCreate', lang)
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 123,
                columnNumber: 19
              }, this)]
            }, void 0, true, {
              fileName: _jsxFileName,
              lineNumber: 115,
              columnNumber: 17
            }, this)]
          }, void 0, true);
        }
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 103,
        columnNumber: 11
      }, this)]
    }, void 0, true) : /*#__PURE__*/_jsxDEV(DisabledFieldForm, {
      lang: lang
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 136,
      columnNumber: 9
    }, this)]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 93,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=FieldAdd.js.map