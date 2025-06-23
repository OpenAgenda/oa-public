// src/components/fields/NumberRangeField.js
import React, { useCallback, useState, useEffect } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useDebounce } from "use-debounce";
import { jsx, jsxs } from "@emotion/react/jsx-runtime";
var messages = defineMessages({
  min: {
    id: "ReactFilters.fields.NumberRangeField.gte",
    defaultMessage: "Min"
  },
  max: {
    id: "ReactFilters.fields.NumberRangeField.lte",
    defaultMessage: "Max"
  }
});
function NumberRangeField({ input }, _ref) {
  const m = useIntl().formatMessage;
  const { value, onChange } = input;
  const [gteString, setGTEString] = useState(value == null ? void 0 : value.gte);
  const [lteString, setLTEString] = useState(value == null ? void 0 : value.lte);
  const [debouncedGTE] = useDebounce(gteString, 500);
  const [debouncedLTE] = useDebounce(lteString, 500);
  const onInputChange = useCallback((k, v) => {
    if (k === "gte") {
      setGTEString(v);
    } else {
      setLTEString(v);
    }
  }, []);
  useEffect(() => {
    setGTEString((value == null ? void 0 : value.gte) ?? "");
    setLTEString((value == null ? void 0 : value.lte) ?? "");
  }, [value]);
  useEffect(() => {
    onChange({
      lte: debouncedLTE,
      gte: debouncedGTE
    });
  }, [debouncedGTE, debouncedLTE, onChange]);
  return /* @__PURE__ */ jsxs("div", { className: "row", children: [
    /* @__PURE__ */ jsxs("div", { className: "col-xs-6", children: [
      /* @__PURE__ */ jsx("label", { className: "sr-only", htmlFor: `number-range-${input.name}-gte`, children: m(messages.min) }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: gteString,
          type: "number",
          className: "form-control",
          id: `number-range-${input.name}-gte`,
          placeholder: m(messages.min),
          onChange: (e) => onInputChange("gte", e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-group col-xs-6", children: [
      /* @__PURE__ */ jsx("label", { className: "sr-only", htmlFor: `number-range-${input.name}-lte`, children: m(messages.max) }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: lteString,
          type: "number",
          className: "form-control",
          id: `number-range-${input.name}-lte`,
          placeholder: m(messages.max),
          onChange: (e) => onInputChange("lte", e.target.value)
        }
      )
    ] })
  ] });
}
var NumberRangeField_default = React.forwardRef(NumberRangeField);

export {
  NumberRangeField_default
};
//# sourceMappingURL=chunk-AAYH72BG.js.map