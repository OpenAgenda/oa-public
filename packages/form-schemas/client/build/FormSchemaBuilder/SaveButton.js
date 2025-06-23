var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/SaveButton.js";
import { Spinner } from '@openagenda/react-shared';
import classNames from 'classnames';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import labels from './lib/labels.js';
import saveStates from './lib/saveStates.js';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(labels);
export default _ref => {
  let {
    saveState,
    lang,
    onClick,
    disabled,
    block
  } = _ref;
  const buttonClasses = classNames({
    btn: true,
    'btn-success': saveState === saveStates.SAVED,
    'btn-primary': saveState !== saveStates.SAVED,
    'btn-block': block,
    'pull-right': true
  });
  if (saveState === saveStates.SAVED) {
    return /*#__PURE__*/_jsxDEV("button", {
      type: "button",
      disabled: true,
      className: buttonClasses,
      children: getLabel('buttonSaved', lang)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 7
    }, this);
  }
  if (saveState === saveStates.LOADING) {
    return /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("button", {
        type: "button",
        disabled: true,
        className: buttonClasses,
        children: /*#__PURE__*/_jsxDEV("span", {
          children: getLabel('buttonSave', lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 31,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV(Spinner, {
        page: true
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 9
      }, this)]
    }, void 0, true);
  }
  if (!disabled && saveState === saveStates.CHANGED) {
    return /*#__PURE__*/_jsxDEV("button", {
      type: "button",
      id: "save",
      className: buttonClasses,
      onClick: onClick,
      children: getLabel('buttonSave', lang)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 39,
      columnNumber: 7
    }, this);
  }
  if (!disabled && saveState === saveStates.ERROR) {
    return /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: buttonClasses,
        onClick: onClick,
        children: getLabel('buttonSave', lang)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 52,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("label", {
        className: "control-label",
        htmlFor: "save",
        children: getLabel('buttonError', lang)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 55,
        columnNumber: 9
      }, this)]
    }, void 0, true);
  }
  return /*#__PURE__*/_jsxDEV("button", {
    type: "button",
    disabled: true,
    className: buttonClasses,
    children: getLabel('buttonSave', lang)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 63,
    columnNumber: 5
  }, this);
};
//# sourceMappingURL=SaveButton.js.map