// src/components/fields/DefinedRangeField.js
import isEqual from "lodash/isEqual.js";
import isDate from "lodash/isDate.js";
import React, { useCallback, useState } from "react";
import { DefinedRange } from "@openagenda/react-date-range";
import useIsomorphicLayoutEffectModule from "react-use/lib/useIsomorphicLayoutEffect.js";
import useLatestModule from "react-use/lib/useLatest.js";
import usePreviousModule from "react-use/lib/usePrevious.js";
import { jsx } from "@emotion/react/jsx-runtime";
var useIsomorphicLayoutEffect = useIsomorphicLayoutEffectModule.default || useIsomorphicLayoutEffectModule;
var useLatest = useLatestModule.default || useLatestModule;
var usePrevious = usePreviousModule.default || usePreviousModule;
var defaultGetInitialValue = () => [
  {
    startDate: null,
    endDate: -1,
    key: "selection"
  }
];
function normalizeValue(value) {
  if (!(value == null ? void 0 : value.length)) {
    return value;
  }
  return value.map((v) => ({
    startDate: isDate(v.startDate) ? v.startDate.getTime() : v.startDate,
    endDate: isDate(v.endDate) ? v.endDate.getTime() : v.endDate,
    key: v.key
  }));
}
function DefinedRangeField({
  input,
  meta,
  staticRanges = [],
  inputRanges = [],
  rangeColor = "#41acdd",
  disabled,
  ...otherProps
}, _ref) {
  const [ranges, setRanges] = useState(
    () => input.value ?? defaultGetInitialValue()
  );
  const latestRanges = useLatest(ranges);
  const previousValue = usePrevious(input.value);
  const { onChange } = input;
  const onDefinedRangeChange = useCallback(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      onChange(value);
    },
    [onChange]
  );
  useIsomorphicLayoutEffect(() => {
    if (previousValue && !isEqual(normalizeValue(input.value), normalizeValue(previousValue)) && !isEqual(
      normalizeValue(input.value),
      normalizeValue(latestRanges.current)
    )) {
      setRanges(input.value);
    }
  }, [input.value, previousValue, latestRanges]);
  const definedRangePickerProps = {
    ranges,
    staticRanges,
    inputRanges,
    rangeColors: [rangeColor],
    ...otherProps
  };
  return /* @__PURE__ */ jsx("div", { className: "rdrDateRangePickerWrapper", children: /* @__PURE__ */ jsx(
    DefinedRange,
    {
      ...definedRangePickerProps,
      onChange: onDefinedRangeChange,
      className: void 0
    }
  ) });
}
var DefinedRangeField_default = React.forwardRef(DefinedRangeField);

export {
  DefinedRangeField_default
};
//# sourceMappingURL=chunk-5AJ5VRO5.js.map