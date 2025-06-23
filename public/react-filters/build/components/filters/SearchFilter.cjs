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

// src/components/filters/SearchFilter.js
var SearchFilter_exports = {};
__export(SearchFilter_exports, {
  default: () => SearchFilter_default
});
module.exports = __toCommonJS(SearchFilter_exports);
var import_react5 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");
var import_react_uid = require("react-uid");
var import_react_intl5 = require("react-intl");

// src/hooks/useFilterTitle.js
var import_react = require("react");
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
  const messages4 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages4[messageKey]) {
    return intl.formatMessage(messages4[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages4) {
  const intl = (0, import_react_intl2.useIntl)();
  return (0, import_react.useMemo)(
    () => getFilterTitle(intl, messages4, messageKey, fieldSchema),
    [intl, messages4, messageKey, fieldSchema]
  );
}

// src/components/ValueBadge.js
var import_classnames = __toESM(require("classnames"), 1);
var import_react_intl3 = require("react-intl");
var import_react2 = require("@emotion/react");
var import_intl2 = require("@openagenda/intl");
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: (0, import_classnames.default)("btn badge badge-pill badge-info margin-right-xs", {
        disabled
      }),
      css: import_react2.css`
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa fa-times", "aria-hidden": "true" })
      ]
    }
  );
}

// src/components/FilterPreviewer.js
var import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
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
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: valueOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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

// src/components/fields/SearchInput.js
var import_react4 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");
var import_use_debounce = require("use-debounce");
var import_react_intl4 = require("react-intl");

// src/contexts/FiltersAndWidgetsContext.js
var import_react3 = require("react");
var FiltersAndWidgetsContext = (0, import_react3.createContext)({
  filters: [],
  widgets: [],
  setFilters: () => {
  },
  setWidgets: () => {
  },
  filtersOptions: {}
});
var FiltersAndWidgetsContext_default = FiltersAndWidgetsContext;

// src/components/fields/SearchInput.js
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
var messages2 = (0, import_react_intl4.defineMessages)({
  ariaLabel: {
    id: "ReactFilters.components.fields.SearchInput.ariaLabel",
    defaultMessage: "Search"
  }
});
function Input({ input, placeholder, ariaLabel, onButtonClick, manualSubmit }) {
  const intl = (0, import_react_intl4.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "input-group mb-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "input",
      {
        className: "form-control",
        autoComplete: "off",
        placeholder,
        "aria-label": ariaLabel,
        title: ariaLabel,
        ...input
      }
    ),
    !manualSubmit ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "input-group-append", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "button",
      {
        type: "submit",
        className: "btn btn-outline-secondary",
        onClick: onButtonClick,
        "aria-label": intl.formatMessage(messages2.ariaLabel),
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { className: "fa fa-search", "aria-hidden": "true" })
      }
    ) }) : null
  ] });
}
function SearchInput({
  inputComponent = Input,
  input,
  onChange,
  // user onChange
  manualSearch,
  ...rest
}) {
  const form = (0, import_react_final_form.useForm)();
  const [tmpValue, setTmpValue] = (0, import_react4.useState)(input.value);
  const {
    filtersOptions: { manualSubmit }
  } = (0, import_react4.useContext)(FiltersAndWidgetsContext_default);
  const debouncedOnChange = (0, import_use_debounce.useDebouncedCallback)((e) => {
    if (manualSearch) {
      return;
    }
    input.onChange(e);
    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  }, 400);
  const inputOnChange = (0, import_react4.useCallback)(
    (e) => {
      e.persist();
      setTmpValue(e.target.value);
      debouncedOnChange(e);
      if (manualSubmit) {
        debouncedOnChange.flush();
      }
    },
    [debouncedOnChange]
  );
  const onButtonClick = (0, import_react4.useCallback)(
    (e) => {
      e.preventDefault();
      if (manualSearch) {
        input.onChange(tmpValue);
        if (typeof onChange === "function") {
          onChange(tmpValue);
        }
      }
      return form.submit();
    },
    [form, input, manualSearch, onChange, tmpValue]
  );
  const wrappedInput = (0, import_react4.useMemo)(
    () => ({
      ...input,
      value: tmpValue,
      onChange: inputOnChange
    }),
    [input, inputOnChange, tmpValue]
  );
  (0, import_react4.useEffect)(() => {
    setTmpValue(input.value);
  }, [input.value]);
  return import_react4.default.createElement(inputComponent, {
    input: wrappedInput,
    onButtonClick,
    manualSubmit,
    ...rest
  });
}

// src/components/filters/SearchFilter.js
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var subscription = { value: true };
var messages3 = (0, import_react_intl5.defineMessages)({
  placeholder: {
    id: "ReactFilters.filters.searchFilter.placeholder",
    defaultMessage: "Search"
  },
  previewLabel: {
    id: "ReactFilters.filters.searchFilter.previewLabel",
    defaultMessage: "Search"
  }
});
function Preview({
  name,
  filter,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const { input } = (0, import_react_final_form2.useField)(name, { subscription });
  const onRemove = (0, import_react5.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      input.onChange(void 0);
    },
    [input, disabled]
  );
  if (!input.value || input.value === "") {
    return null;
  }
  return import_react5.default.createElement(component, {
    name,
    filter,
    label: input.value,
    onRemove,
    disabled,
    ...rest
  });
}
var SearchFilter = import_react5.default.forwardRef(function SearchFilter2({ name, filter, component = SearchInput, placeholder = null, ...rest }, _ref) {
  const seed = (0, import_react_uid.useUIDSeed)();
  const intl = (0, import_react_intl5.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    import_react_final_form2.Field,
    {
      name,
      subscription,
      component,
      type: "text",
      filter,
      placeholder: placeholder || intl.formatMessage(messages3.placeholder),
      ...rest
    },
    seed(filter)
  );
});
var exported = import_react5.default.memo(SearchFilter);
exported.Preview = Preview;
var SearchFilter_default = exported;
//# sourceMappingURL=SearchFilter.cjs.map