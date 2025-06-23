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

// src/components/filters/ChoiceFilter.js
var ChoiceFilter_exports = {};
__export(ChoiceFilter_exports, {
  default: () => ChoiceFilter_default
});
module.exports = __toCommonJS(ChoiceFilter_exports);
var import_react7 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");
var import_react_uid2 = require("react-uid");
var import_react_intl7 = require("react-intl");
var import_usePrevious2 = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_react8 = require("@emotion/react");

// src/components/fields/ChoiceField.js
var import_react = __toESM(require("react"), 1);
var import_react_uid = require("react-uid");
var import_react_intl = require("react-intl");
var import_classnames = __toESM(require("classnames"), 1);
var import_intl = require("@openagenda/intl");
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
function useOnChoiceChange(input, preventDefault) {
  const inputRef = (0, import_react.useRef)();
  const onChange = (0, import_react.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)((e) => {
      if (e.target === inputRef.current) {
        return;
      }
      if (preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.currentTarget.getAttribute("aria-disabled") === "true") {
        return;
      }
      if (e.currentTarget.getAttribute("aria-checked") === "true") {
        input.onChange({
          target: {
            type: input.type,
            value: input.value,
            checked: false
          }
        });
        return;
      }
      input.onChange({
        target: {
          type: input.type,
          value: input.value,
          checked: true
        }
      });
    }),
    [input.onChange, input.type, input.value, preventDefault]
  );
  return {
    inputRef,
    onChange
  };
}
var ChoiceField = import_react.default.forwardRef(function ChoiceField2({
  input,
  getTotal,
  filter,
  option,
  disabled,
  tag: Tag = "div",
  preventDefault = true
}, ref) {
  const intl = (0, import_react_intl.useIntl)();
  const seed = (0, import_react_uid.useUIDSeed)();
  const total = (0, import_react.useMemo)(
    () => getTotal == null ? void 0 : getTotal(filter, option),
    [filter, getTotal, option]
  );
  const { inputRef, onChange } = useOnChoiceChange(input, preventDefault);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    Tag,
    {
      className: (0, import_classnames.default)(input.type, {
        disabled,
        active: input.checked,
        inactive: !input.checked
      }),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "span",
        {
          ref,
          className: "oa-choice-option-label",
          role: "checkbox",
          tabIndex: "0",
          "aria-checked": input.checked,
          "aria-disabled": disabled,
          onClick: onChange,
          onKeyPress: onChange,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                ref: inputRef,
                tabIndex: "-1",
                type: input.type,
                id: seed(input),
                disabled,
                ...input
              }
            ),
            (0, import_intl.getLocaleValue)(option.label, intl.locale) || /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "\xA0" }),
            Number.isInteger(total) && total !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "oa-filter-total", children: total }) : null
          ]
        }
      )
    }
  );
});
var ChoiceField_default = ChoiceField;

// src/components/Title.js
var import_react3 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");

// src/hooks/useFilterTitle.js
var import_react2 = require("react");
var import_react_intl3 = require("react-intl");

// src/utils/getFilterTitle.js
var import_intl2 = require("@openagenda/intl");

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
  const messages2 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl2.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages2[messageKey]) {
    return intl.formatMessage(messages2[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages2) {
  const intl = (0, import_react_intl3.useIntl)();
  return (0, import_react2.useMemo)(
    () => getFilterTitle(intl, messages2, messageKey, fieldSchema),
    [intl, messages2, messageKey, fieldSchema]
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
var import_classnames2 = __toESM(require("classnames"), 1);
var import_a11yButtonActionHandler2 = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
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
    () => (0, import_a11yButtonActionHandler2.default)((e) => {
      e.preventDefault();
      updater((v) => !v);
    }),
    [updater]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: (0, import_classnames2.default)("oa-collapse-item", { "oa-collapse-item-active": !value }),
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
                  className: (0, import_classnames2.default)("fa fa-lg", {
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
            className: (0, import_classnames2.default)("oa-collapse-content", {
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
var import_classnames3 = __toESM(require("classnames"), 1);
var import_react_intl4 = require("react-intl");
var import_react5 = require("@emotion/react");
var import_intl3 = require("@openagenda/intl");
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl4.defineMessages)({
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
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages.removeFilterWithTitle, { title }) : intl.formatMessage(messages.removeFilter);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: (0, import_classnames3.default)("btn badge badge-pill badge-info margin-right-xs", {
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
        (0, import_intl3.getLocaleValue)(label, intl.locale),
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

// src/hooks/useChoiceState.js
var import_react6 = require("react");
var import_useIsomorphicLayoutEffect = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_usePrevious = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_react_intl5 = require("react-intl");
var import_fuse = __toESM(require("fuse.js"), 1);
var import_useConstant = __toESM(require("@openagenda/react-shared/dist/hooks/useConstant.js"), 1);
var useIsomorphicLayoutEffect = import_useIsomorphicLayoutEffect.default.default || import_useIsomorphicLayoutEffect.default;
var usePrevious = import_usePrevious.default.default || import_usePrevious.default;
function getCollator(locale, defaultLocale) {
  try {
    return new Intl.Collator(locale, {
      sensitivity: "base",
      usage: "sort"
    });
  } catch {
    return new Intl.Collator(defaultLocale, {
      sensitivity: "base",
      usage: "sort"
    });
  }
}
function filterOptions({ options, fuse, searchValue, sort, collator }) {
  if (searchValue === "") {
    if (sort === "alphabetical") {
      return [...options].sort((a, b) => collator.compare(a.label, b.label));
    }
    return options;
  }
  return fuse.search(searchValue).map((v) => v.item);
}
function useChoiceState({
  filter,
  getOptions,
  pageSize,
  collapsed = false,
  sort = null
}) {
  const intl = (0, import_react_intl5.useIntl)();
  const [countOptions, setCountOptions] = (0, import_react6.useState)(pageSize);
  const options = (0, import_react6.useMemo)(() => getOptions(filter), [filter, getOptions]);
  const fuse = (0, import_useConstant.default)(
    () => new import_fuse.default(options, {
      threshold: 0.3,
      ignoreLocation: true,
      keys: ["label"]
    })
  );
  const collator = (0, import_react6.useMemo)(
    () => getCollator(intl.locale, intl.defaultLocale),
    [intl.defaultLocale, intl.locale]
  );
  const [searchValue, setSearchValue] = (0, import_react6.useState)("");
  const previousSearchValue = usePrevious(searchValue);
  const [foundOptions, setFoundOptions] = (0, import_react6.useState)(
    filterOptions({
      options,
      fuse,
      searchValue,
      sort,
      collator
    })
  );
  const moreOptions = (0, import_react6.useCallback)(
    () => setCountOptions((v) => v + pageSize),
    [pageSize]
  );
  const lessOptions = (0, import_react6.useCallback)(() => setCountOptions(pageSize), [pageSize]);
  const previousCollpased = usePrevious(collapsed);
  useIsomorphicLayoutEffect(() => {
    if (previousCollpased && !collapsed) {
      lessOptions();
    }
  }, [collapsed, lessOptions, previousCollpased]);
  const hasMoreOptions = countOptions < foundOptions.length;
  const onSearchChange = (0, import_react6.useCallback)((e) => setSearchValue(e.target.value), []);
  useIsomorphicLayoutEffect(() => {
    if (options !== fuse._docs) {
      fuse.setCollection(options);
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator
      });
      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, sort, collator]);
  useIsomorphicLayoutEffect(() => {
    if (previousSearchValue !== void 0 && searchValue !== previousSearchValue) {
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator
      });
      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, previousSearchValue, sort, collator]);
  return {
    options,
    searchValue,
    onSearchChange,
    foundOptions,
    countOptions,
    hasMoreOptions,
    moreOptions,
    lessOptions
  };
}

// src/messages/choiceFilter.js
var import_react_intl6 = require("react-intl");
var choiceFilter_default = (0, import_react_intl6.defineMessages)({
  noResult: {
    id: "ReactFilters.messages.choiceFilter.noResult",
    defaultMessage: "No result"
  },
  searchPlaceholder: {
    id: "ReactFilters.messages.choiceFilter.searchPlaceholder",
    defaultMessage: "Search"
  },
  moreOptions: {
    id: "ReactFilters.messages.choiceFilter.moreOptions",
    defaultMessage: "More options"
  },
  lessOptions: {
    id: "ReactFilters.messages.choiceFilter.lessOptions",
    defaultMessage: "Less options"
  },
  unrecognizedOption: {
    id: "ReactFilters.messages.choiceFilter.unrecognizedOption",
    defaultMessage: "Unknown filter value ({value})"
  }
});

// src/components/filters/ChoiceFilter.js
var import_jsx_runtime6 = require("@emotion/react/jsx-runtime");
var usePrevious2 = import_usePrevious2.default.default || import_usePrevious2.default;
var subscription2 = { value: true };
function parseValue(value) {
  if (Array.isArray(value) && !value.length) {
    return void 0;
  }
  return value;
}
function formatValue(value) {
  return value;
}
function Preview({
  name,
  filter,
  getOptions,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl7.useIntl)();
  const { input } = (0, import_react_final_form2.useField)(name, { subscription: subscription2 });
  const options = (0, import_react7.useMemo)(() => getOptions(filter), [filter, getOptions]);
  const valueOptions = (0, import_react7.useMemo)(() => {
    if ([void 0, null, ""].includes(input == null ? void 0 : input.value)) {
      return [];
    }
    if (!options.length) {
      return [];
    }
    return [].concat(input.value).map(
      (v) => options.find((option) => option.value === v) ?? {
        value: v,
        label: intl.formatMessage(choiceFilter_default.unrecognizedOption, { value: v })
      }
    );
  }, [input.value, options, intl]);
  const onRemove = (0, import_react7.useCallback)(
    (option) => (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      if (!Array.isArray(input.value)) {
        input.onChange(void 0);
        return;
      }
      const newValue = input.value.filter((v) => v !== option.value);
      input.onChange(newValue.length ? newValue : void 0);
    },
    [input, disabled]
  );
  if (!(valueOptions == null ? void 0 : valueOptions.length)) {
    return null;
  }
  return import_react7.default.createElement(component, {
    name,
    filter,
    getOptions,
    valueOptions,
    onRemove,
    disabled,
    ...rest
  });
}
var ChoiceFilter = import_react7.default.forwardRef(function ChoiceFilter2({
  name,
  filter,
  getTotal,
  searchPlaceholder,
  searchAriaLabel,
  getOptions,
  disabled,
  collapsed,
  inputType = "checkbox",
  pageSize = 10,
  searchMinSize = 2 * pageSize,
  sort,
  tag,
  preventDefault
}, _ref) {
  const intl = (0, import_react_intl7.useIntl)();
  const seed = (0, import_react_uid2.useUIDSeed)();
  const {
    options,
    searchValue,
    onSearchChange,
    foundOptions,
    countOptions,
    hasMoreOptions,
    moreOptions,
    lessOptions
  } = useChoiceState({
    filter,
    getOptions,
    collapsed,
    pageSize,
    sort
  });
  const newOptionRef = (0, import_react7.useRef)(null);
  const previousCountOptions = usePrevious2(countOptions);
  (0, import_react7.useEffect)(() => {
    if (newOptionRef.current && countOptions !== previousCountOptions && countOptions - pageSize === previousCountOptions) {
      newOptionRef.current.focus();
    }
  }, [countOptions, previousCountOptions]);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
    options.length > searchMinSize ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "input",
      {
        className: "form-control input-sm margin-top-xs",
        value: searchValue,
        onChange: onSearchChange,
        placeholder: searchPlaceholder || intl.formatMessage(choiceFilter_default.searchPlaceholder),
        "aria-label": searchAriaLabel,
        title: searchAriaLabel,
        css: import_react8.css`
            width: 50%;
          `
      }
    ) : null,
    foundOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-muted margin-v-xs", children: intl.formatMessage(choiceFilter_default.noResult) }) : null,
    foundOptions.map((option, index) => index < countOptions ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      import_react_final_form2.Field,
      {
        name,
        subscription: subscription2,
        parse: parseValue,
        format: formatValue,
        component: ChoiceField_default,
        type: inputType,
        value: option.value,
        option,
        filter,
        getTotal,
        disabled,
        tag,
        preventDefault,
        ref: index === countOptions - pageSize ? newOptionRef : null
      },
      seed(option)
    ) : null),
    hasMoreOptions ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        type: "button",
        className: "btn btn-link btn-link-inline",
        onClick: moreOptions,
        children: intl.formatMessage(choiceFilter_default.moreOptions)
      }
    ) : null,
    !hasMoreOptions && countOptions > pageSize ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        type: "button",
        className: "btn btn-link btn-link-inline",
        onClick: lessOptions,
        children: intl.formatMessage(choiceFilter_default.lessOptions)
      }
    ) : null
  ] });
});
var Collapsable = import_react7.default.forwardRef(function Collapsable2({ name, filter, component, getTotal, getOptions, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react7.useState)(filter.defaultCollapsed ?? true);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview,
          getOptions,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        ChoiceFilter,
        {
          ref,
          name,
          filter,
          component,
          getTotal,
          getOptions,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported = import_react7.default.memo(ChoiceFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var ChoiceFilter_default = exported;
//# sourceMappingURL=ChoiceFilter.cjs.map