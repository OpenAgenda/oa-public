import {
  ValueBadge
} from "./chunk-YEYQEFWM.js";
import {
  useFilterTitle
} from "./chunk-FHMHSQDZ.js";

// src/components/FilterPreviewer.js
import { Fragment, jsx } from "@emotion/react/jsx-runtime";
function FilterPreviewer({
  withTitle = true,
  name,
  filter,
  label,
  valueOptions,
  onRemove,
  disabled,
  className
}) {
  const title = useFilterTitle(name, filter.fieldSchema);
  if (valueOptions == null ? void 0 : valueOptions.length) {
    return /* @__PURE__ */ jsx(Fragment, { children: valueOptions.map((option) => /* @__PURE__ */ jsx("span", { className, children: /* @__PURE__ */ jsx(
      ValueBadge,
      {
        label: option.label,
        onRemove: onRemove(option),
        disabled,
        title: withTitle ? title : null
      }
    ) }, option.value)) });
  }
  if (label) {
    return /* @__PURE__ */ jsx("span", { className, children: /* @__PURE__ */ jsx(
      ValueBadge,
      {
        label,
        onRemove,
        disabled,
        title: withTitle ? title : null
      }
    ) });
  }
  return null;
}

export {
  FilterPreviewer
};
//# sourceMappingURL=chunk-FUQD6HGF.js.map