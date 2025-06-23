import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/FieldPreview/Content.js";
import getFieldTypeLabel from '../lib/getFieldTypeLabel.js';
import { isFieldLinked, isFieldMultilingual, isFieldDisplayed, isFieldEditable, isFieldOptional, getLabel, getDefaultValueLabel, getFieldTypeIcon, allowItemDisplayToggle, isAccessUndefined, getFieldAccess } from './utils.js';
import { getSummary as getLinkedFieldSummaryLabel, getDetailed as getLinkedFieldDetailedLabel } from './linkedFieldLabels.js';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
function renderToggleRemove(props) {
  const {
    isDisabled,
    onRemove,
    lang,
    field,
    isOwn
  } = props;
  return isFieldDisplayed(field) && isOwn ? /*#__PURE__*/_jsxDEV("button", {
    type: "button",
    onClick: () => isDisabled ? null : onRemove(),
    className: "btn btn-link",
    children: /*#__PURE__*/_jsxDEV("span", {
      className: "text-danger",
      children: getLabel('removeField', lang)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 7
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 26,
    columnNumber: 5
  }, this) : null;
}
function renderToggleHidden(props) {
  const {
    field,
    onShow,
    onHide,
    lang
  } = props;
  return isFieldDisplayed(field) ? /*#__PURE__*/_jsxDEV("button", {
    type: "button",
    onClick: () => onHide(),
    className: "btn btn-link",
    children: getLabel('hideField', lang)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 40,
    columnNumber: 5
  }, this) : /*#__PURE__*/_jsxDEV("button", {
    type: "button",
    name: "show-".concat(field.field),
    className: "btn btn-link",
    onClick: () => onShow(),
    children: getLabel('showField', lang)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 44,
    columnNumber: 5
  }, this);
}
function getInfoLabel(props) {
  const {
    editable,
    lang,
    disabled
  } = props;
  if (!editable) {
    return getLabel('uneditableFieldInfo', lang);
  }
  if (disabled) {
    return null;
  }
  return getLabel('editFieldInfo', lang);
}
export default function Content(props) {
  const {
    field,
    lang,
    schema,
    ordering,
    editableExtensions,
    isOwn,
    disabled,
    onEdit
  } = props;
  const {
    has: hasIcon,
    className: iconClassName
  } = getFieldTypeIcon(field);
  const editable = isFieldEditable(field, {
    isOwn,
    editableExtensions
  });
  const isDisabled = !editable || disabled;
  return /*#__PURE__*/_jsxDEV(_Fragment, {
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-xs",
      children: [isFieldOptional(field) ? null : /*#__PURE__*/_jsxDEV("span", {
        className: "form-icon margin-right-sm",
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "obligatoire"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 89,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("span", {
          className: "optional",
          children: getLabel('requiredField', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 90,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 88,
        columnNumber: 11
      }, this), isFieldDisplayed(field) ? null : /*#__PURE__*/_jsxDEV("span", {
        className: "form-icon margin-right-sm",
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "hidden-field"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 95,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("span", {
          className: "his-hidden",
          children: getLabel('hiddenField', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 96,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 94,
        columnNumber: 11
      }, this), field.fieldType ? /*#__PURE__*/_jsxDEV("span", {
        className: "form-icon margin-right-sm",
        children: [hasIcon ? /*#__PURE__*/_jsxDEV("i", {
          className: iconClassName
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 101,
          columnNumber: 24
        }, this) : null, /*#__PURE__*/_jsxDEV("span", {
          className: "fieldtype",
          children: getFieldTypeLabel(field, lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 102,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 100,
        columnNumber: 11
      }, this) : null, isFieldMultilingual(field) ? /*#__PURE__*/_jsxDEV("span", {
        className: "form-icon margin-right-sm",
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "languages"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 107,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("span", {
          className: "multilingual-label",
          children: getLabel('isMultilingual', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 108,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 106,
        columnNumber: 11
      }, this) : null, isFieldLinked(field) ? /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "form-tooltip-icon icon-hide form-icon",
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "linked"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 116,
            columnNumber: 15
          }, this), /*#__PURE__*/_jsxDEV("div", {
            className: "tooltip right",
            role: "tooltip",
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "tooltip-arrow",
              children: " "
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 118,
              columnNumber: 17
            }, this), /*#__PURE__*/_jsxDEV("div", {
              className: "tooltip-inner",
              children: getLinkedFieldDetailedLabel({
                field,
                lang,
                schema
              })
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 119,
              columnNumber: 17
            }, this)]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 117,
            columnNumber: 15
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 115,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("span", {
          className: "linked-label",
          children: getLinkedFieldSummaryLabel({
            field,
            lang,
            schema
          })
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 124,
          columnNumber: 13
        }, this)]
      }, void 0, true) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 86,
      columnNumber: 7
    }, this), isAccessUndefined(field) ? null : /*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-xs",
      children: /*#__PURE__*/_jsxDEV("span", {
        className: "form-icon margin-right-sm",
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "access"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 133,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("span", {
          className: "his-hidden",
          children: getFieldAccess(field, lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 134,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 132,
        columnNumber: 11
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 131,
      columnNumber: 9
    }, this), field.field ? /*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-xs",
      title: getLabel('jsonKey', lang),
      children: [getLabel('jsonKey', lang), ": ", field.field]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 139,
      columnNumber: 9
    }, this) : null, 'default' in field && field.default !== null ? /*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-xs",
      title: getLabel('defaultValue', lang),
      children: [getLabel('defaultValue', lang), " : ", getDefaultValueLabel(field, lang)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 144,
      columnNumber: 9
    }, this) : null, field.max ? /*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-xs",
      title: getLabel('maxLength', lang),
      children: [getLabel('maxLength', lang), ": ", field.max]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 149,
      columnNumber: 9
    }, this) : null, ordering ? /*#__PURE__*/_jsxDEV("ul", {
      className: "form-item-actions list-inline",
      children: /*#__PURE__*/_jsxDEV("li", {
        children: /*#__PURE__*/_jsxDEV("span", {
          className: "btn btn-link",
          children: getLabel('orderField', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 156,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 155,
        columnNumber: 11
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 154,
      columnNumber: 9
    }, this) : /*#__PURE__*/_jsxDEV("div", {
      className: "form-item-actions padding-h-xs",
      children: [isFieldDisplayed(field) ? /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        name: "edit-".concat(field.field),
        title: getInfoLabel(_objectSpread(_objectSpread({}, props), {}, {
          editable
        })),
        onClick: () => !isDisabled ? onEdit() : null,
        className: "btn btn-link",
        disabled: !editable || disabled,
        children: getLabel('editField', lang)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 162,
        columnNumber: 13
      }, this) : null, allowItemDisplayToggle(field) ? renderToggleHidden(props) : null, isOwn ? renderToggleRemove(props) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 9
    }, this)]
  }, void 0, true);
}
//# sourceMappingURL=Content.js.map