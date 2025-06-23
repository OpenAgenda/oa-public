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

// src/components/filters/NumberRangeFilter.js
var NumberRangeFilter_exports = {};
__export(NumberRangeFilter_exports, {
  default: () => NumberRangeFilter_default
});
module.exports = __toCommonJS(NumberRangeFilter_exports);
var import_react6 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");

// src/components/fields/NumberRangeField.js
var import_react = __toESM(require("react"), 1);
var import_react_intl = require("react-intl");
var import_use_debounce = require("use-debounce");
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl.defineMessages)({
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
  const m = (0, import_react_intl.useIntl)().formatMessage;
  const { value, onChange } = input;
  const [gteString, setGTEString] = (0, import_react.useState)(value == null ? void 0 : value.gte);
  const [lteString, setLTEString] = (0, import_react.useState)(value == null ? void 0 : value.lte);
  const [debouncedGTE] = (0, import_use_debounce.useDebounce)(gteString, 500);
  const [debouncedLTE] = (0, import_use_debounce.useDebounce)(lteString, 500);
  const onInputChange = (0, import_react.useCallback)((k, v) => {
    if (k === "gte") {
      setGTEString(v);
    } else {
      setLTEString(v);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    setGTEString((value == null ? void 0 : value.gte) ?? "");
    setLTEString((value == null ? void 0 : value.lte) ?? "");
  }, [value]);
  (0, import_react.useEffect)(() => {
    onChange({
      lte: debouncedLTE,
      gte: debouncedGTE
    });
  }, [debouncedGTE, debouncedLTE, onChange]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "col-xs-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "sr-only", htmlFor: `number-range-${input.name}-gte`, children: m(messages.min) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "form-group col-xs-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "sr-only", htmlFor: `number-range-${input.name}-lte`, children: m(messages.max) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var NumberRangeField_default = import_react.default.forwardRef(NumberRangeField);

// src/components/Panel.js
var import_react2 = require("react");
var import_classnames = __toESM(require("classnames"), 1);
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children
}) {
  const internalState = (0, import_react2.useState)(collapsed);
  const value = typeof setCollapsed === "function" ? collapsed : internalState[0];
  const updater = typeof setCollapsed === "function" ? setCollapsed : internalState[1];
  const toggleCollapsed = (0, import_react2.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)((e) => {
      e.preventDefault();
      updater((v) => !v);
    }),
    [updater]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      className: (0, import_classnames.default)("oa-collapse-item", { "oa-collapse-item-active": !value }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "oa-collapse-arrow", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            className: (0, import_classnames.default)("oa-collapse-content", {
              "oa-collapse-content-active": !value,
              "oa-collapse-content-inactive": value
            }),
            role: "tabpanel",
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "oa-collapse-content-box", children })
          }
        )
      ]
    }
  );
}

// src/components/Title.js
var import_react4 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");

// src/hooks/useFilterTitle.js
var import_react3 = require("react");
var import_react_intl3 = require("react-intl");

// src/utils/getFilterTitle.js
var import_intl = require("@openagenda/intl");

// src/messages/filterTitles.js
var import_react_intl2 = require("react-intl");
var filterTitles_default = (0, import_react_intl2.defineMessages)({
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
  const intl = (0, import_react_intl3.useIntl)();
  return (0, import_react3.useMemo)(
    () => getFilterTitle(intl, messages3, messageKey, fieldSchema),
    [intl, messages3, messageKey, fieldSchema]
  );
}

// src/components/Title.js
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
var subscription = { value: true };
function Title({ name, filter, component, ...rest }) {
  var _a;
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = (0, import_react_final_form.useField)(name, { subscription });
  const { input } = field;
  if (!((_a = input.value) == null ? void 0 : _a.length) && !(typeof input.value === "object" && input.value !== null)) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: title });
  }
  if (!component) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex-auto", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "padding-right-xs", children: title }),
    import_react4.default.createElement(component, {
      name,
      filter,
      className: "oa-filter-value-preview",
      withTitle: false,
      ...rest
    })
  ] });
}

// src/components/ValueBadge.js
var import_classnames2 = __toESM(require("classnames"), 1);
var import_react_intl4 = require("react-intl");
var import_react5 = require("@emotion/react");
var import_intl2 = require("@openagenda/intl");
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var messages2 = (0, import_react_intl4.defineMessages)({
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
  const intl = (0, import_react_intl4.useIntl)();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages2.removeFilterWithTitle, { title }) : intl.formatMessage(messages2.removeFilter);
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

// src/components/filters/NumberRangeFilter.js
var import_jsx_runtime6 = require("@emotion/react/jsx-runtime");
var subscription2 = { value: true };
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
  const { input } = (0, import_react_final_form2.useField)(name, { subscription: subscription2 });
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
  if (!((_a = input.value) == null ? void 0 : _a.gte) && !((_b = input.value) == null ? void 0 : _b.lte)) {
    return null;
  }
  return import_react6.default.createElement(component, {
    name,
    label: formatPreviewLabel(input.value),
    onRemove,
    disabled,
    ...rest
  });
}
var NumberRangeFilter = import_react6.default.forwardRef(function NumberRangeFilter2({ name }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    import_react_final_form2.Field,
    {
      ref,
      name,
      subscription: subscription2,
      parse: parseValue,
      component: NumberRangeField_default
    }
  );
});
var Collapsable = import_react6.default.forwardRef(function Collapsable2({ name, filter, component, disabled, ...rest }, ref) {
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
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
var exported = import_react6.default.memo(NumberRangeFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var NumberRangeFilter_default = exported;
//# sourceMappingURL=NumberRangeFilter.cjs.map