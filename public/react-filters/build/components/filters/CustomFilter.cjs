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

// src/components/filters/CustomFilter.js
var CustomFilter_exports = {};
__export(CustomFilter_exports, {
  default: () => CustomFilter_default
});
module.exports = __toCommonJS(CustomFilter_exports);
var import_react3 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);

// src/utils/matchQuery.js
var import_isMatch = __toESM(require("lodash/isMatch.js"), 1);
var import_omitBy = __toESM(require("lodash/omitBy.js"), 1);
var import_isEmpty = __toESM(require("lodash/isEmpty.js"), 1);
function matchQuery(a, b) {
  return (0, import_isMatch.default)((0, import_omitBy.default)(a, import_isEmpty.default), (0, import_omitBy.default)(b, import_isEmpty.default));
}

// src/utils/updateFormValues.js
function updateFormValues(form, query, active = true) {
  form.batch(() => {
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (active) {
          form.change(key, query[key]);
        } else {
          form.change(key, void 0);
        }
      }
    }
  });
}

// src/utils/updateCustomFilter.js
function updateCustomFilter(filter, active) {
  const activeClass = filter.activeClass || "active";
  const inactiveClass = filter.inactiveClass || "inactive";
  const { classList } = filter.activeTargetElem || filter.elem;
  const handlerElem = filter.handlerElem || filter.elem;
  const innerCheckboxes = handlerElem.querySelectorAll(
    'input[type="checkbox"]'
  );
  const checkbox = innerCheckboxes.length === 1 ? innerCheckboxes[0] : null;
  if (active) {
    if (classList.contains(inactiveClass)) classList.remove(inactiveClass);
    if (!classList.contains(activeClass)) classList.add(activeClass);
    if (checkbox && !checkbox.checked) checkbox.checked = true;
  } else {
    if (classList.contains(activeClass)) classList.remove(activeClass);
    if (!classList.contains(inactiveClass)) classList.add(inactiveClass);
    if (checkbox && checkbox.checked) checkbox.checked = false;
  }
}

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
  const messages2 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages2[messageKey]) {
    return intl.formatMessage(messages2[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages2) {
  const intl = (0, import_react_intl2.useIntl)();
  return (0, import_react.useMemo)(
    () => getFilterTitle(intl, messages2, messageKey, fieldSchema),
    [intl, messages2, messageKey, fieldSchema]
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

// src/components/filters/CustomFilter.js
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
var subscription = { values: true };
function Preview({
  name,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  filter,
  query,
  ...rest
}) {
  const form = (0, import_react_final_form.useForm)();
  const onRemove = (0, import_react3.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      updateFormValues(form, filter.query, false);
    },
    [disabled, form, filter]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react_final_form.FormSpy, { subscription, children: ({ values }) => {
    if (!matchQuery(values, query) || !activeFilterLabel) {
      return null;
    }
    return import_react3.default.createElement(component, {
      name,
      label: activeFilterLabel,
      onRemove,
      disabled,
      filter,
      ...rest
    });
  } });
}
function CustomFilter({ filter }) {
  const form = (0, import_react_final_form.useForm)();
  const firstRender = (0, import_react3.useRef)(true);
  const updateForm = (0, import_react3.useCallback)(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const query = form.getState().values;
      updateFormValues(form, filter.query, !matchQuery(query, filter.query));
    },
    [filter.query, form]
  );
  const onChange = (0, import_react3.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)(updateForm),
    [updateForm]
  );
  (0, import_react3.useEffect)(() => {
    if (firstRender.current) {
      firstRender.current = false;
      const query = form.getState().values;
      const matchInitialQuery = matchQuery(query, filter.query);
      const registeredFields = form.getRegisteredFields();
      for (const key in filter.query) {
        if (Object.prototype.hasOwnProperty.call(filter.query, key)) {
          if (!registeredFields.includes(key)) {
            form.registerField(
              key,
              () => {
              },
              { value: true },
              {
                initialValue: matchInitialQuery ? filter.query[key] : void 0
              }
            );
          }
        }
      }
    }
    const handlerElem = filter.handlerElem || filter.elem;
    const innerCheckboxes = handlerElem.querySelectorAll(
      'input[type="checkbox"]'
    );
    const handlerIsLabelWithCheckbox = innerCheckboxes.length === 1 && handlerElem.tagName === "LABEL" && handlerElem.contains(innerCheckboxes[0]);
    if (innerCheckboxes.length === 1 && (!filter.handlerElem || handlerIsLabelWithCheckbox)) {
      innerCheckboxes[0].addEventListener("change", updateForm, false);
    } else {
      handlerElem.addEventListener("click", onChange, false);
    }
    handlerElem.addEventListener("keydown", onChange, false);
    const unsubscribe = form.subscribe(
      ({ values }) => updateCustomFilter(filter, matchQuery(values, filter.query)),
      { values: true }
    );
    return () => {
      if (innerCheckboxes.length === 1 && (!filter.handlerElem || handlerIsLabelWithCheckbox)) {
        innerCheckboxes[0].removeEventListener("change", updateForm, false);
      } else {
        handlerElem.removeEventListener("click", onChange, false);
      }
      handlerElem.removeEventListener("keydown", onChange, false);
      unsubscribe();
    };
  }, [filter, form, onChange, updateForm]);
  return null;
}
var exported = import_react3.default.memo(CustomFilter);
exported.Preview = Preview;
var CustomFilter_default = exported;
//# sourceMappingURL=CustomFilter.cjs.map