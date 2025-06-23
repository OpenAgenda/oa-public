var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/FieldPreview/Head.js";
import { getLocaleValue } from '@openagenda/intl';
import getFieldTypeLabel from '../lib/getFieldTypeLabel.js';
import { getLabel, isFieldOptional, isFieldDisplayed, isFieldMultilingual, isFieldLinked, getFieldTypeIcon, isAccessUndefined, getFieldAccess } from './utils.js';
import { getSummary as getLinkedFieldSummaryLabel } from './linkedFieldLabels.js';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const MAX_DISPLAYED_OPTIONS = 4;
const renderSchemaInfo = (schemaInfo, lang) => {
  if (!schemaInfo) {
    return null;
  }
  return /*#__PURE__*/_jsxDEV("div", {
    title: getLocaleValue(schemaInfo.detail, lang),
    className: "margin-top-xs",
    children: getLocaleValue(schemaInfo.label, lang)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 25,
    columnNumber: 5
  }, this);
};
const renderOptionsInfo = (options, lang) => {
  if (!options) {
    return null;
  }
  if (options.length >= MAX_DISPLAYED_OPTIONS) {
    return /*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-xs text-muted",
      children: [options === null || options === void 0 ? void 0 : options.slice(0, MAX_DISPLAYED_OPTIONS).map((option, index) => /*#__PURE__*/_jsxDEV("span", {
        children: [getLocaleValue(option.label, lang), index <= MAX_DISPLAYED_OPTIONS ? ', ' : '']
      }, getLocaleValue(option.label, lang), true, {
        fileName: _jsxFileName,
        lineNumber: 42,
        columnNumber: 11
      }, this)), /*#__PURE__*/_jsxDEV("span", {
        children: [' ', "+ ", options.length - MAX_DISPLAYED_OPTIONS, ' ', getLabel('moreOptions', lang)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 47,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 40,
      columnNumber: 7
    }, this);
  }
  return /*#__PURE__*/_jsxDEV("div", {
    className: "margin-top-xs text-muted",
    children: options === null || options === void 0 ? void 0 : options.map((option, index) => /*#__PURE__*/_jsxDEV("span", {
      children: [getLocaleValue(option.label, lang), index < options.length - 1 ? ', ' : '']
    }, getLocaleValue(option.label, lang), true, {
      fileName: _jsxFileName,
      lineNumber: 58,
      columnNumber: 9
    }, this))
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 56,
    columnNumber: 5
  }, this);
};
const getLabelPrefix = (field, lang) => {
  if (field.type !== 'section') {
    return '';
  }
  if (!field.label) {
    return getLabel('section', lang);
  }
  return "".concat(getLabel('section', lang), ": ");
};
export default function Head(props) {
  const {
    field,
    lang,
    schema,
    schemaInfo
  } = props;
  const {
    has: hasIcon,
    className: iconClassName
  } = getFieldTypeIcon(field);
  return /*#__PURE__*/_jsxDEV(_Fragment, {
    children: [/*#__PURE__*/_jsxDEV("label", {
      className: "margin-right-xs margin-top-xs",
      htmlFor: isFieldDisplayed(field) ? "edit-".concat(field.field) : "show-".concat(field.field),
      children: [getLabelPrefix(field, lang), getLocaleValue(field.label, lang)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 86,
      columnNumber: 7
    }, this), isAccessUndefined(field) ? null : /*#__PURE__*/_jsxDEV("span", {
      className: "form-tooltip-icon icon-hide margin-right-xs",
      children: [hasIcon ? /*#__PURE__*/_jsxDEV("i", {
        className: "access"
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 99,
        columnNumber: 22
      }, this) : null, /*#__PURE__*/_jsxDEV("div", {
        className: "tooltip right",
        role: "tooltip",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-arrow",
          children: " "
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 101,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-inner",
          children: getFieldAccess(field, lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 102,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 100,
        columnNumber: 11
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 98,
      columnNumber: 9
    }, this), isFieldOptional(field) ? null : /*#__PURE__*/_jsxDEV("span", {
      className: "form-tooltip-icon icon-hide margin-right-xs",
      children: [/*#__PURE__*/_jsxDEV("i", {
        className: "obligatoire"
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 108,
        columnNumber: 11
      }, this), /*#__PURE__*/_jsxDEV("div", {
        className: "tooltip right",
        role: "tooltip",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-arrow",
          children: " "
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 110,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-inner",
          children: getLabel('requiredField', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 111,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 109,
        columnNumber: 11
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 107,
      columnNumber: 9
    }, this), isFieldDisplayed(field) ? null : /*#__PURE__*/_jsxDEV("span", {
      className: "form-tooltip-icon icon-hide margin-right-xs",
      children: [/*#__PURE__*/_jsxDEV("i", {
        className: "hidden-field"
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 119,
        columnNumber: 11
      }, this), /*#__PURE__*/_jsxDEV("div", {
        className: "tooltip right",
        role: "tooltip",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-arrow",
          children: " "
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 121,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-inner",
          children: getLabel('hiddenField', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 122,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 120,
        columnNumber: 11
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 9
    }, this), field.fieldType ? /*#__PURE__*/_jsxDEV("span", {
      className: "form-tooltip-icon icon-hide margin-right-xs",
      children: [hasIcon ? /*#__PURE__*/_jsxDEV("i", {
        className: iconClassName
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 128,
        columnNumber: 22
      }, this) : null, /*#__PURE__*/_jsxDEV("div", {
        className: "tooltip right",
        role: "tooltip",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-arrow",
          children: " "
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 130,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-inner",
          children: getFieldTypeLabel(field, lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 131,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 129,
        columnNumber: 11
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 127,
      columnNumber: 9
    }, this) : null, isFieldMultilingual(field) ? /*#__PURE__*/_jsxDEV("span", {
      className: "form-tooltip-icon icon-hide margin-right-xs",
      children: [/*#__PURE__*/_jsxDEV("i", {
        className: "languages"
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 139,
        columnNumber: 11
      }, this), /*#__PURE__*/_jsxDEV("div", {
        className: "tooltip right",
        role: "tooltip",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-arrow",
          children: " "
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 141,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-inner",
          children: getLabel('isMultilingual', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 142,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 140,
        columnNumber: 11
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 138,
      columnNumber: 9
    }, this) : null, isFieldLinked(field) ? /*#__PURE__*/_jsxDEV("span", {
      className: "form-tooltip-icon icon-hide margin-right-xs",
      children: [/*#__PURE__*/_jsxDEV("i", {
        className: "linked"
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 150,
        columnNumber: 11
      }, this), /*#__PURE__*/_jsxDEV("div", {
        className: "tooltip right",
        role: "tooltip",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-arrow",
          children: " "
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 152,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "tooltip-inner",
          children: getLinkedFieldSummaryLabel({
            field,
            lang,
            schema
          })
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 153,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 151,
        columnNumber: 11
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 149,
      columnNumber: 9
    }, this) : null, field.purpose ? /*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-xs",
      children: getLocaleValue(field.purpose, lang)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 9
    }, this) : renderSchemaInfo(schemaInfo, lang), renderOptionsInfo(field.options, lang)]
  }, void 0, true);
}
//# sourceMappingURL=Head.js.map