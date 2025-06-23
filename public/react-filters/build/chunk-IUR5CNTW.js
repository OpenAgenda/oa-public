// src/components/fields/SimpleDateRangeField.js
import React, { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";
import { jsx, jsxs } from "@emotion/react/jsx-runtime";
var messages = defineMessages({
  startDate: {
    id: "ReactFilters.fields.SimpleRangeField.startDate",
    defaultMessage: "Start date"
  },
  endDate: {
    id: "ReactFilters.fields.SimpleRangeField.endDate",
    defaultMessage: "End date"
  }
});
function SimpleDateRangeField({ input }, _ref) {
  const intl = useIntl();
  const { value, onChange } = input;
  const onInputChange = useCallback(
    (k, v) => {
      if (k === "gte") {
        onChange({
          ...value,
          gte: v
        });
      } else {
        onChange({
          ...value,
          lte: v
        });
      }
    },
    [onChange, value]
  );
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { children: [
      intl.formatMessage(messages.startDate),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: (value == null ? void 0 : value.gte) || "",
          type: "date",
          className: "form-control",
          onChange: (e) => onInputChange("gte", e.target.value),
          max: value == null ? void 0 : value.lte
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { children: [
      intl.formatMessage(messages.endDate),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: (value == null ? void 0 : value.lte) || "",
          type: "date",
          className: "form-control",
          onChange: (e) => onInputChange("lte", e.target.value),
          min: value == null ? void 0 : value.gte
        }
      )
    ] })
  ] });
}
var SimpleDateRangeField_default = React.forwardRef(SimpleDateRangeField);

export {
  SimpleDateRangeField_default
};
//# sourceMappingURL=chunk-IUR5CNTW.js.map