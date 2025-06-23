import {
  DateRangePicker_default
} from "./chunk-4RS6ODMJ.js";
import {
  Panel
} from "./chunk-KLWUSN74.js";
import {
  Title
} from "./chunk-CD5KYVA4.js";
import {
  FilterPreviewer
} from "./chunk-FUQD6HGF.js";

// src/components/filters/DateRangeFilter.js
import React, { useCallback, useMemo, useState } from "react";
import { Field, useField } from "react-final-form";
import { defineMessages, useIntl } from "react-intl";
import { parseISO, endOfDay, isSameDay } from "date-fns";
import { utcToZonedTime, getTimezoneOffset } from "date-fns-tz";
import { jsx } from "@emotion/react/jsx-runtime";
var messages = defineMessages({
  dateRange: {
    id: "ReactFilters.DateRangeFilter.dateRange",
    defaultMessage: "From {startDate} to {endDate}"
  },
  startDate: {
    id: "ReactFilters.DateRangeFilter.startDate",
    defaultMessage: "Start"
  },
  endDate: {
    id: "ReactFilters.DateRangeFilter.endDate",
    defaultMessage: "End"
  },
  until: {
    id: "ReactFilters.DateRangeFilter.until",
    defaultMessage: "Until {date}"
  },
  from: {
    id: "ReactFilters.DateRangeFilter.from",
    defaultMessage: "From {date}"
  }
});
var subscription = { value: true };
function formatDateValue(value) {
  if (!value || value === "") {
    return null;
  }
  return typeof value === "string" ? parseISO(value) : value;
}
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
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzDiff = getTimezoneOffset(value.tz, value.gte) - getTimezoneOffset(currentTz, value.gte);
  if (Array.isArray(value)) {
    return value.map((v) => {
      const startDate = formatDateValue(v.gte);
      const endDate = formatDateValue(v.lte);
      return {
        ...v,
        startDate: tzDiff && startDate ? utcToZonedTime(startDate, v.tz) : startDate,
        endDate: tzDiff && endDate ? utcToZonedTime(endDate, v.tz) : endDate
      };
    });
  }
  if (typeof value === "object") {
    const startDate = formatDateValue(value.gte);
    const endDate = formatDateValue(value.lte);
    return [
      {
        startDate: tzDiff && startDate ? utcToZonedTime(startDate, value.tz) : startDate,
        endDate: tzDiff && endDate ? utcToZonedTime(endDate, value.tz) : endDate,
        key: "selection"
      }
    ];
  }
  return value;
}
function parseValue(value) {
  var _a;
  if (!value) {
    return value;
  }
  const [selection] = value;
  if (selection.startDate === null && selection.endDate === null) {
    return void 0;
  }
  const gte = ((_a = selection.startDate) == null ? void 0 : _a.toISOString()) ?? null;
  const lte = (selection.endDate ? endOfDay(selection.endDate) : selection.endDate).toISOString();
  const result = {};
  if (gte) result.gte = gte;
  if (lte) result.lte = lte;
  result.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return result;
}
function Preview({
  name,
  staticRanges = [],
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = useIntl();
  const { input } = useField(name, { subscription });
  const { tz } = input.value;
  const value = formatValue(input.value)[0];
  const selectedStaticRange = useMemo(
    () => value && staticRanges.find((v) => v.isSelected(value, tz)),
    [value, staticRanges, tz]
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
  const formatDate = (v) => intl.formatDate(
    v
    /* , { timeZone: tz } */
  );
  if (selectedStaticRange) {
    label = selectedStaticRange.label;
  } else if (value.startDate === null) {
    label = intl.formatMessage(messages.until, {
      date: formatDate(value.endDate)
    });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages.from, {
      date: formatDate(value.startDate)
    });
  } else {
    label = singleDay ? formatDate(value.startDate) : intl.formatMessage(messages.dateRange, {
      startDate: formatDate(value.startDate),
      endDate: formatDate(value.endDate)
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
var DateRangeFilter = React.forwardRef(function DateRangeFilter2({
  name,
  staticRanges,
  inputRanges,
  rangeColor,
  className,
  dateFormatStyle,
  dateFormat,
  minDate,
  maxDate,
  shownDate,
  getQuery
}, ref) {
  const intl = useIntl();
  return /* @__PURE__ */ jsx(
    Field,
    {
      ref,
      name,
      subscription,
      parse: parseValue,
      format: formatValue,
      component: DateRangePicker_default,
      staticRanges,
      inputRanges,
      startDatePlaceholder: intl.formatMessage(messages.startDate),
      endDatePlaceholder: intl.formatMessage(messages.endDate),
      rangeColor,
      className,
      dateFormatStyle,
      dateFormat,
      minDate,
      maxDate,
      shownDate,
      getQuery
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
        DateRangeFilter,
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
var exported = React.memo(DateRangeFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var DateRangeFilter_default = exported;

export {
  formatValue,
  Preview,
  DateRangeFilter_default
};
//# sourceMappingURL=chunk-MC7YQHTQ.js.map