import {
  DefinedRangeField_default
} from "./chunk-5AJ5VRO5.js";
import {
  Panel
} from "./chunk-KLWUSN74.js";
import {
  Title
} from "./chunk-CD5KYVA4.js";
import {
  FilterPreviewer
} from "./chunk-FUQD6HGF.js";

// src/components/filters/DefinedRangeFilter.js
import React, { useCallback, useMemo, useState } from "react";
import { Field, useField } from "react-final-form";
import { defineMessages, useIntl } from "react-intl";
import { parseISO, endOfDay, isSameDay } from "date-fns";
import { jsx } from "@emotion/react/jsx-runtime";
var messages = defineMessages({
  singleDate: {
    id: "ReactFilters.DefinedRangeFilter.singleDate",
    defaultMessage: "{date}"
  },
  dateRange: {
    id: "ReactFilters.DefinedRangeFilter.dateRange",
    defaultMessage: "From {startDate} to {endDate}"
  },
  startDate: {
    id: "ReactFilters.DefinedRangeFilter.startDate",
    defaultMessage: "Start"
  },
  endDate: {
    id: "ReactFilters.DefinedRangeFilter.endDate",
    defaultMessage: "End"
  },
  until: {
    id: "ReactFilters.DefinedRangeFilter.until",
    defaultMessage: "Until {date}"
  },
  from: {
    id: "ReactFilters.DefinedRangeFilter.from",
    defaultMessage: "From {date}"
  }
});
var subscription = { value: true };
function formatValue(value) {
  if (value === void 0) {
    return [
      {
        startDate: null,
        endDate: null,
        key: "selection"
      }
    ];
  }
  if (Array.isArray(value)) {
    return value.map((v) => ({
      ...v,
      startDate: typeof v.gte === "string" ? parseISO(v.gte) : v.gte,
      endDate: typeof v.lte === "string" ? parseISO(v.lte) : v.lte
    }));
  }
  if (typeof value === "object") {
    return [
      {
        startDate: typeof value.gte === "string" ? parseISO(value.gte) : value.gte,
        endDate: typeof value.lte === "string" ? parseISO(value.lte) : value.lte,
        key: "selection"
      }
    ];
  }
  return value;
}
function parseValue(value) {
  if (!value) {
    return value;
  }
  const [selection] = value;
  if (selection.startDate === null && selection.endDate === null) {
    return void 0;
  }
  return {
    gte: selection.startDate.toISOString(),
    lte: (selection.endDate ? endOfDay(selection.endDate) : selection.endDate).toISOString(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
function Preview({
  name,
  staticRanges = [],
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  var _a;
  const intl = useIntl();
  const { input } = useField(name, {
    subscription,
    parse: parseValue,
    format: formatValue
  });
  const value = (_a = input.value) == null ? void 0 : _a[0];
  const selectedStaticRange = useMemo(
    () => value && staticRanges.find((v) => v.isSelected(value)),
    [value, staticRanges]
  );
  const singleDay = useMemo(
    () => (value == null ? void 0 : value.startDate) && (value == null ? void 0 : value.endDate) && isSameDay(value.startDate, value.endDate),
    [value]
  );
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
  let label;
  if (!(value == null ? void 0 : value.startDate) && !(value == null ? void 0 : value.endDate)) {
    return null;
  }
  if (selectedStaticRange) {
    label = selectedStaticRange.label;
  } else if (value.startDate === null) {
    label = intl.formatMessage(messages.until, { date: value.endDate });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages.from, { date: value.startDate });
  } else {
    label = singleDay ? intl.formatMessage(messages.singleDate, { date: value.startDate }) : intl.formatMessage(messages.dateRange, {
      startDate: value.startDate,
      endDate: value.endDate
    });
  }
  return React.createElement(component, {
    name,
    staticRanges,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var DefinedRangeFilter = React.forwardRef(function DefinedRangeFilter2({ name, staticRanges, inputRanges }, ref) {
  return /* @__PURE__ */ jsx(
    Field,
    {
      ref,
      name,
      subscription,
      parse: parseValue,
      format: formatValue,
      component: DefinedRangeField_default,
      staticRanges,
      inputRanges
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
          staticRanges,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ jsx(
        DefinedRangeFilter,
        {
          ref,
          name,
          filter,
          component,
          staticRanges,
          inputRanges,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported = React.memo(DefinedRangeFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var DefinedRangeFilter_default = exported;

export {
  DefinedRangeFilter_default
};
//# sourceMappingURL=chunk-SFQSTNHB.js.map