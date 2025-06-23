import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/OptionItem.js";
import { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import getPreferredLang from './lib/getPreferredLang.js';
import labels from './lib/labels.js';
import OptionLabelsForm from './OptionLabelsForm.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(labels);
const OptionItem = _ref => {
  let {
    field,
    lang,
    index,
    option,
    otherOptions,
    onUpdate,
    onEditCancel,
    isEdited,
    actionable,
    onEdit,
    onRemove,
    disableDnD
  } = _ref;
  const renderEdit = useCallback(() => /*#__PURE__*/_jsxDEV(OptionLabelsForm, {
    index: index,
    option: option,
    otherOptions: otherOptions,
    onSubmit: onUpdate,
    onCancel: onEditCancel,
    lang: lang,
    languages: field.labelLanguages
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 27,
    columnNumber: 7
  }, this), [field.labelLanguages, index, lang, onEditCancel, onUpdate, option, otherOptions]);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over
  } = useSortable({
    id: option.value,
    disabled: disableDnD
  });
  const style = {
    transform: transform ? "translate3d(".concat(transform.x, "px, ").concat(transform.y, "px, 0)") : undefined,
    transition,
    zIndex: isDragging ? 100 : 'auto'
  };
  const child = /*#__PURE__*/_jsxDEV("div", _objectSpread(_objectSpread(_objectSpread({
    className: "list-group-item draggable",
    ref: setNodeRef,
    style: isDragging || over ? style : null
  }, attributes), listeners), {}, {
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "list-group-item-content draggable",
      children: isEdited ? renderEdit() : /*#__PURE__*/_jsxDEV("div", {
        className: "margin-left-sm",
        children: [/*#__PURE__*/_jsxDEV("label", {
          htmlFor: "option-".concat(option.id),
          className: "margin-v-xs text-left",
          children: getPreferredLang(option.label, lang)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 79,
          columnNumber: 15
        }, this), /*#__PURE__*/_jsxDEV("div", {
          className: "form-item-actions padding-h-xs",
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            id: "option-".concat(option.id),
            disabled: !actionable,
            onClick: () => onEdit(index),
            className: "btn btn-link",
            children: getLabel('optionEdit', lang)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 86,
            columnNumber: 17
          }, this), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            disabled: !actionable,
            onClick: onRemove,
            className: "btn btn-link",
            children: /*#__PURE__*/_jsxDEV("span", {
              className: "text text-danger",
              children: getLabel('optionRemove', lang)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 101,
              columnNumber: 19
            }, this)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 95,
            columnNumber: 17
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 85,
          columnNumber: 15
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 78,
        columnNumber: 13
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 74,
      columnNumber: 7
    }, this)
  }), void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 67,
    columnNumber: 5
  }, this);
  return child;
};
export default OptionItem;
//# sourceMappingURL=OptionItem.js.map