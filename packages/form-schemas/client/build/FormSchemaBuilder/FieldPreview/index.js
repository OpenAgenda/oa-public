import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/FieldPreview/index.js";
import { Accordion } from '@openagenda/react-shared';
import { useSortable } from '@dnd-kit/sortable';
import Head from './Head.js';
import Content from './Content.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export default function FieldPreview(props) {
  const {
    onAccordionToggle,
    active,
    schema,
    field,
    disabled
  } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over
  } = useSortable({
    id: field.field || field.slug
  });
  const style = {
    transform: transform ? "translate3d(".concat(transform.x, "px, ").concat(transform.y, "px, 0)") : undefined,
    transition,
    zIndex: isDragging ? 100 : 'auto'
  };
  return /*#__PURE__*/_jsxDEV("div", _objectSpread(_objectSpread(_objectSpread({
    ref: setNodeRef,
    className: "list-group-item draggable ".concat(disabled ? 'disabled' : ''),
    style: isDragging || over ? style : null
  }, attributes), listeners), {}, {
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "list-group-item-content draggable ".concat(disabled ? 'disabled' : ''),
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "field-preview",
        children: /*#__PURE__*/_jsxDEV(Accordion, {
          head: /*#__PURE__*/_jsxDEV(Head, _objectSpread({}, props), void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 40,
            columnNumber: 19
          }, this),
          content: /*#__PURE__*/_jsxDEV(Content, _objectSpread({}, props), void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 41,
            columnNumber: 22
          }, this),
          onToggle: onAccordionToggle,
          active: active,
          schema: schema
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 39,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 38,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 35,
      columnNumber: 7
    }, this)
  }), void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 28,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=index.js.map