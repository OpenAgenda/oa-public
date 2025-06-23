import {
  Selection
} from "./chunk-NSIWX63Y.js";
import {
  Add
} from "./chunk-XJNLOVRC.js";

// src/components/Events/index.js
import { jsx, jsxs } from "react/jsx-runtime";
function EventsAdditionalFieldComponent({
  field,
  value,
  lang,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      Selection,
      {
        res: field.res,
        value,
        lang,
        onChange,
        id: `${field.field}-selection`
      }
    ),
    /* @__PURE__ */ jsx(
      Add,
      {
        res: field.res,
        value,
        lang,
        onChange,
        id: `${field.field}-add`
      }
    )
  ] });
}

export {
  EventsAdditionalFieldComponent
};
//# sourceMappingURL=chunk-OE7763HL.js.map