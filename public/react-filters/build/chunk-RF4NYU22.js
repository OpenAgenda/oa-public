import {
  SimpleDateRangeField_default
} from "./chunk-IUR5CNTW.js";
import {
  Preview
} from "./chunk-MC7YQHTQ.js";
import {
  Panel
} from "./chunk-KLWUSN74.js";
import {
  Title
} from "./chunk-CD5KYVA4.js";

// src/components/filters/SimpleDateRangeFilter.js
import React, { useState } from "react";
import { Field } from "react-final-form";
import { endOfDay, startOfDay, format } from "date-fns";
import { getTimezoneOffset, utcToZonedTime } from "date-fns-tz";
import { jsx } from "@emotion/react/jsx-runtime";
var subscription = { value: true };
function formatDateValue(value, tz) {
  if (!value) return value;
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzDiff = getTimezoneOffset(tz, value) - getTimezoneOffset(currentTz, value);
  let date = new Date(value);
  if (tzDiff) {
    date = utcToZonedTime(date, tz);
  }
  return date;
}
function formatValue(value) {
  if (!value) {
    return void 0;
  }
  const gte = formatDateValue(value.gte, value.tz);
  const lte = formatDateValue(value.lte, value.tz);
  return {
    gte: gte ? format(gte, "yyyy-MM-dd") : null,
    lte: lte ? format(lte, "yyyy-MM-dd") : null
  };
}
function parseValue(value) {
  if (!value) {
    return value;
  }
  const gte = value.gte ? startOfDay(new Date(value.gte)).toISOString() : null;
  const lte = value.lte ? endOfDay(new Date(value.lte)).toISOString() : null;
  const result = {};
  if (gte) result.gte = gte;
  if (lte) result.lte = lte;
  if (gte || lte) result.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return result;
}
var SimpleDateRangeFilter = React.forwardRef(function SimpleDateRangeFilter2({ name }, ref) {
  return /* @__PURE__ */ jsx(
    Field,
    {
      ref,
      name,
      subscription,
      format: formatValue,
      parse: parseValue,
      component: SimpleDateRangeField_default
    }
  );
});
var Collapsable = React.forwardRef(function Collapsable2({ name, filter, component, disabled, staticRanges, inputRanges, ...rest }, ref) {
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
        SimpleDateRangeFilter,
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
var exported = React.memo(SimpleDateRangeFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var SimpleDateRangeFilter_default = exported;

export {
  SimpleDateRangeFilter_default
};
//# sourceMappingURL=chunk-RF4NYU22.js.map