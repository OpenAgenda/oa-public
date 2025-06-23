var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/filters/DefinedRangeFilter.js
var DefinedRangeFilter_exports = {};
__export(DefinedRangeFilter_exports, {
  default: () => DefinedRangeFilter_default
});
module.exports = __toCommonJS(DefinedRangeFilter_exports);
var import_react6 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");
var import_react_intl4 = require("react-intl");
var import_date_fns = require("date-fns");

// src/components/fields/DefinedRangeField.js
var import_isEqual = __toESM(require("lodash/isEqual.js"), 1);
var import_isDate = __toESM(require("lodash/isDate.js"), 1);
var import_react = __toESM(require("react"), 1);
var import_react_date_range = require("@openagenda/react-date-range");
var import_useIsomorphicLayoutEffect = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_useLatest = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_usePrevious = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var useIsomorphicLayoutEffect = import_useIsomorphicLayoutEffect.default.default || import_useIsomorphicLayoutEffect.default;
var useLatest = import_useLatest.default.default || import_useLatest.default;
var usePrevious = import_usePrevious.default.default || import_usePrevious.default;
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
    startDate: (0, import_isDate.default)(v.startDate) ? v.startDate.getTime() : v.startDate,
    endDate: (0, import_isDate.default)(v.endDate) ? v.endDate.getTime() : v.endDate,
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
  const [ranges, setRanges] = (0, import_react.useState)(
    () => input.value ?? defaultGetInitialValue()
  );
  const latestRanges = useLatest(ranges);
  const previousValue = usePrevious(input.value);
  const { onChange } = input;
  const onDefinedRangeChange = (0, import_react.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      onChange(value);
    },
    [onChange]
  );
  useIsomorphicLayoutEffect(() => {
    if (previousValue && !(0, import_isEqual.default)(normalizeValue(input.value), normalizeValue(previousValue)) && !(0, import_isEqual.default)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rdrDateRangePickerWrapper", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_react_date_range.DefinedRange,
    {
      ...definedRangePickerProps,
      onChange: onDefinedRangeChange,
      className: void 0
    }
  ) });
}
var DefinedRangeField_default = import_react.default.forwardRef(DefinedRangeField);

// src/components/Title.js
var import_react3 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");

// src/hooks/useFilterTitle.js
var import_react2 = require("react");
var import_react_intl2 = require("react-intl");

// src/utils/getFilterTitle.js
var import_intl = require("@openagenda/intl");

// src/messages/filterTitles.js
var import_react_intl = require("react-intl");
var filterTitles_default = (0, import_react_intl.defineMessages)({
  geo: {
    id: "ReactFilters.messages.filterTitles.geo",
    defaultMessage: "Map"
  },
  search: {
    id: "ReactFilters.messages.filterTitles.search",
    defaultMessage: "Search"
  },
  addMethod: {
    id: "ReactFilters.messages.filterTitles.addMethod",
    defaultMessage: "Provenance"
  },
  memberUid: {
    id: "ReactFilters.messages.filterTitles.memberUid",
    defaultMessage: "Member"
  },
  locationUid: {
    id: "ReactFilters.messages.filterTitles.locationUid",
    defaultMessage: "Location"
  },
  sourceAgendaUid: {
    id: "ReactFilters.messages.filterTitles.sourceAgendaUid",
    defaultMessage: "Source agenda"
  },
  originAgendaUid: {
    id: "ReactFilters.messages.filterTitles.originAgendaUid",
    defaultMessage: "Origin agenda"
  },
  featured: {
    id: "ReactFilters.messages.filterTitles.featured",
    defaultMessage: "Featured"
  },
  relative: {
    id: "ReactFilters.messages.filterTitles.relative",
    defaultMessage: "Passed / current / upcoming"
  },
  region: {
    id: "ReactFilters.messages.filterTitles.region",
    defaultMessage: "Region"
  },
  department: {
    id: "ReactFilters.messages.filterTitles.department",
    defaultMessage: "Department"
  },
  countryCode: {
    id: "ReactFilters.messages.filterTitles.countryCode",
    defaultMessage: "Country"
  },
  city: {
    id: "ReactFilters.messages.filterTitles.city",
    defaultMessage: "City"
  },
  adminLevel3: {
    id: "ReactFilters.messages.filterTitles.adminLevel3",
    defaultMessage: "Administrative level 3"
  },
  timings: {
    id: "ReactFilters.messages.filterTitles.timings",
    defaultMessage: "Date"
  },
  createdAt: {
    id: "ReactFilters.messages.filterTitles.createdAt",
    defaultMessage: "Creation date"
  },
  updatedAt: {
    id: "ReactFilters.messages.filterTitles.updatedAt",
    defaultMessage: "Date of update"
  },
  keyword: {
    id: "ReactFilters.messages.filterTitles.keyword",
    defaultMessage: "Keywords"
  },
  state: {
    id: "ReactFilters.messages.filterTitles.state",
    defaultMessage: "State"
  },
  attendanceMode: {
    id: "ReactFilters.messages.filterTitles.attendanceMode",
    defaultMessage: "Attendance mode"
  },
  status: {
    id: "ReactFilters.messages.filterTitles.status",
    defaultMessage: "Status"
  },
  district: {
    id: "ReactFilters.messages.filterTitles.district",
    defaultMessage: "District"
  },
  accessibility: {
    id: "ReactFilters.messages.filterTitles.accessibility",
    defaultMessage: "Accessibility"
  },
  languages: {
    id: "ReactFilters.messages.filterTitles.languages",
    defaultMessage: "Languages"
  }
});

// src/utils/getFilterTitle.js
function getFilterTitle(intl, providedMessages, messageKey, fieldSchema) {
  const messages3 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages3[messageKey]) {
    return intl.formatMessage(messages3[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages3) {
  const intl = (0, import_react_intl2.useIntl)();
  return (0, import_react2.useMemo)(
    () => getFilterTitle(intl, messages3, messageKey, fieldSchema),
    [intl, messages3, messageKey, fieldSchema]
  );
}

// src/components/Title.js
var import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
var subscription = { value: true };
function Title({ name, filter, component, ...rest }) {
  var _a;
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = (0, import_react_final_form.useField)(name, { subscription });
  const { input } = field;
  if (!((_a = input.value) == null ? void 0 : _a.length) && !(typeof input.value === "object" && input.value !== null)) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: title });
  }
  if (!component) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex-auto", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "padding-right-xs", children: title }),
    import_react3.default.createElement(component, {
      name,
      filter,
      className: "oa-filter-value-preview",
      withTitle: false,
      ...rest
    })
  ] });
}

// src/components/Panel.js
var import_react4 = require("react");
var import_classnames = __toESM(require("classnames"), 1);
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children
}) {
  const internalState = (0, import_react4.useState)(collapsed);
  const value = typeof setCollapsed === "function" ? collapsed : internalState[0];
  const updater = typeof setCollapsed === "function" ? setCollapsed : internalState[1];
  const toggleCollapsed = (0, import_react4.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)((e) => {
      e.preventDefault();
      updater((v) => !v);
    }),
    [updater]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: (0, import_classnames.default)("oa-collapse-item", { "oa-collapse-item-active": !value }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: "oa-collapse-header",
            role: "tab",
            tabIndex: "0",
            "aria-expanded": !value,
            onClick: toggleCollapsed,
            onKeyPress: toggleCollapsed,
            children: [
              header,
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "oa-collapse-arrow", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "i",
                {
                  className: (0, import_classnames.default)("fa fa-lg", {
                    "fa-angle-up": !value,
                    "fa-angle-down": value
                  }),
                  "aria-hidden": "true"
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: (0, import_classnames.default)("oa-collapse-content", {
              "oa-collapse-content-active": !value,
              "oa-collapse-content-inactive": value
            }),
            role: "tabpanel",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oa-collapse-content-box", children })
          }
        )
      ]
    }
  );
}

// src/components/ValueBadge.js
var import_classnames2 = __toESM(require("classnames"), 1);
var import_react_intl3 = require("react-intl");
var import_react5 = require("@emotion/react");
var import_intl2 = require("@openagenda/intl");
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl3.defineMessages)({
  removeFilter: {
    id: "ReactFilters.ValueBadge.removeFilter",
    defaultMessage: "Remove filter"
  },
  removeFilterWithTitle: {
    id: "ReactFilters.ValueBadge.removeFilterWithTitle",
    defaultMessage: "Remove filter ({title})"
  }
});
function ValueBadge({ label, title, onRemove, disabled }) {
  const intl = (0, import_react_intl3.useIntl)();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages.removeFilterWithTitle, { title }) : intl.formatMessage(messages.removeFilter);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: (0, import_classnames2.default)("btn badge badge-pill badge-info margin-right-xs", {
        disabled
      }),
      css: import_react5.css`
        line-height: 18px;
        padding-top: 0;
        padding-bottom: 0;

        :hover {
          color: #da4453;
          border-color: #d43f3a;
        }
      `,
      onClick: onRemove,
      children: [
        (0, import_intl2.getLocaleValue)(label, intl.locale),
        "\xA0",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", { className: "fa fa-times", "aria-hidden": "true" })
      ]
    }
  );
}

// src/components/FilterPreviewer.js
var import_jsx_runtime5 = require("@emotion/react/jsx-runtime");
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
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_jsx_runtime5.Fragment, { children: valueOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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

// src/components/filters/DefinedRangeFilter.js
var import_jsx_runtime6 = require("@emotion/react/jsx-runtime");
var messages2 = (0, import_react_intl4.defineMessages)({
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
var subscription2 = { value: true };
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
      startDate: typeof v.gte === "string" ? (0, import_date_fns.parseISO)(v.gte) : v.gte,
      endDate: typeof v.lte === "string" ? (0, import_date_fns.parseISO)(v.lte) : v.lte
    }));
  }
  if (typeof value === "object") {
    return [
      {
        startDate: typeof value.gte === "string" ? (0, import_date_fns.parseISO)(value.gte) : value.gte,
        endDate: typeof value.lte === "string" ? (0, import_date_fns.parseISO)(value.lte) : value.lte,
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
    lte: (selection.endDate ? (0, import_date_fns.endOfDay)(selection.endDate) : selection.endDate).toISOString(),
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
  const intl = (0, import_react_intl4.useIntl)();
  const { input } = (0, import_react_final_form2.useField)(name, {
    subscription: subscription2,
    parse: parseValue,
    format: formatValue
  });
  const value = (_a = input.value) == null ? void 0 : _a[0];
  const selectedStaticRange = (0, import_react6.useMemo)(
    () => value && staticRanges.find((v) => v.isSelected(value)),
    [value, staticRanges]
  );
  const singleDay = (0, import_react6.useMemo)(
    () => (value == null ? void 0 : value.startDate) && (value == null ? void 0 : value.endDate) && (0, import_date_fns.isSameDay)(value.startDate, value.endDate),
    [value]
  );
  const onRemove = (0, import_react6.useCallback)(
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
    label = intl.formatMessage(messages2.until, { date: value.endDate });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages2.from, { date: value.startDate });
  } else {
    label = singleDay ? intl.formatMessage(messages2.singleDate, { date: value.startDate }) : intl.formatMessage(messages2.dateRange, {
      startDate: value.startDate,
      endDate: value.endDate
    });
  }
  return import_react6.default.createElement(component, {
    name,
    staticRanges,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var DefinedRangeFilter = import_react6.default.forwardRef(function DefinedRangeFilter2({ name, staticRanges, inputRanges }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    import_react_final_form2.Field,
    {
      ref,
      name,
      subscription: subscription2,
      parse: parseValue,
      format: formatValue,
      component: DefinedRangeField_default,
      staticRanges,
      inputRanges
    }
  );
});
var Collapsable = import_react6.default.forwardRef(function Collapsable2({ name, filter, component, disabled, staticRanges, inputRanges, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react6.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
var exported = import_react6.default.memo(DefinedRangeFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var DefinedRangeFilter_default = exported;
//# sourceMappingURL=DefinedRangeFilter.cjs.map