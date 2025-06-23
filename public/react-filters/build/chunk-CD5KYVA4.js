import {
  useFilterTitle
} from "./chunk-FHMHSQDZ.js";

// src/components/Title.js
import React from "react";
import { useField } from "react-final-form";
import { jsx, jsxs } from "@emotion/react/jsx-runtime";
var subscription = { value: true };
function Title({ name, filter, component, ...rest }) {
  var _a;
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = useField(name, { subscription });
  const { input } = field;
  if (!((_a = input.value) == null ? void 0 : _a.length) && !(typeof input.value === "object" && input.value !== null)) {
    return /* @__PURE__ */ jsx("div", { children: title });
  }
  if (!component) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex-auto", children: [
    /* @__PURE__ */ jsx("span", { className: "padding-right-xs", children: title }),
    React.createElement(component, {
      name,
      filter,
      className: "oa-filter-value-preview",
      withTitle: false,
      ...rest
    })
  ] });
}

export {
  Title
};
//# sourceMappingURL=chunk-CD5KYVA4.js.map