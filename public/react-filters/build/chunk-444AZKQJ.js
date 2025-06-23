import {
  NumberRangeField_default
} from "./chunk-AAYH72BG.js";
import {
  Panel
} from "./chunk-KLWUSN74.js";
import {
  Title
} from "./chunk-CD5KYVA4.js";
import {
  FilterPreviewer
} from "./chunk-FUQD6HGF.js";

// src/components/filters/NumberRangeFilter.js
import React, { useState, useCallback } from "react";
import { Field, useField } from "react-final-form";
import { jsx } from "@emotion/react/jsx-runtime";
var subscription = { value: true };
var isDefined = (v) => ![void 0, null, ""].includes(v);
function formatPreviewLabel(value) {
  if (!isDefined(value.gte) && isDefined(value.lte)) {
    return `\u2264 ${value.lte}`;
  }
  if (isDefined(value.gte) && !isDefined(value.lte)) {
    return `\u2265 ${value.gte}`;
  }
  if (isDefined(value.gte) && isDefined(value.lte)) {
    return `${value.gte} \u2264 ${value.lte}`;
  }
}
function parseValue(value) {
  const definedLte = isDefined(value == null ? void 0 : value.lte);
  const definedGte = isDefined(value == null ? void 0 : value.gte);
  if (!definedLte && !definedGte) {
    return void 0;
  }
  const result = {};
  if (definedLte) result.lte = value.lte;
  if (definedGte) result.gte = value.gte;
  return result;
}
function Preview({ name, component = FilterPreviewer, disabled, ...rest }) {
  var _a, _b;
  const { input } = useField(name, { subscription });
  const onRemove = useCallback(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      input.onChange(void 0);
    },
    [input, disabled]
  );
  if (!((_a = input.value) == null ? void 0 : _a.gte) && !((_b = input.value) == null ? void 0 : _b.lte)) {
    return null;
  }
  return React.createElement(component, {
    name,
    label: formatPreviewLabel(input.value),
    onRemove,
    disabled,
    ...rest
  });
}
var NumberRangeFilter = React.forwardRef(function NumberRangeFilter2({ name }, ref) {
  return /* @__PURE__ */ jsx(
    Field,
    {
      ref,
      name,
      subscription,
      parse: parseValue,
      component: NumberRangeField_default
    }
  );
});
var Collapsable = React.forwardRef(function Collapsable2({ name, filter, component, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = useState(true);
  return /* @__PURE__ */ jsx(
    Panel,
    {
      header: /* @__PURE__ */ jsx(
        Title,
        {
          name,
          filter,
          component: Preview,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ jsx(
        NumberRangeFilter,
        {
          ref,
          name,
          filter,
          component,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported = React.memo(NumberRangeFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var NumberRangeFilter_default = exported;

export {
  NumberRangeFilter_default
};
//# sourceMappingURL=chunk-444AZKQJ.js.map