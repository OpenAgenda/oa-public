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

// src/components/Sort.js
var Sort_exports = {};
__export(Sort_exports, {
  default: () => Sort
});
module.exports = __toCommonJS(Sort_exports);
var import_react = require("react");
var import_react_intl = require("react-intl");
var import_react_final_form = require("react-final-form");
var import_react_final_form_listeners = require("react-final-form-listeners");
var import_ReactSelectField = __toESM(require("@openagenda/react-shared/dist/components/ReactSelectField.js"), 1);
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var { defaultStyles: defaultReactSelectStyles } = import_ReactSelectField.default;
var messages = (0, import_react_intl.defineMessages)({
  relevance: {
    id: "ReactFilters.Sort.relevance",
    defaultMessage: "Relevance"
  },
  chronological: {
    id: "ReactFilters.Sort.chronological",
    defaultMessage: "Chronological order"
  },
  recentlyUpdated: {
    id: "ReactFilters.Sort.recentlyUpdated",
    defaultMessage: "Recently updated"
  },
  publicView: {
    id: "ReactFilters.Sort.publicView",
    defaultMessage: "Public view"
  }
});
var stateSelectStyles = {
  ...defaultReactSelectStyles,
  container: (provided) => ({
    ...provided,
    display: "inline-block",
    width: "180px"
  }),
  control: (provided, state) => ({
    ...defaultReactSelectStyles.control(provided, state),
    cursor: "pointer"
  }),
  valueContainer: (provided, state) => ({
    ...defaultReactSelectStyles.valueContainer(provided, state),
    padding: "0 4px"
  }),
  option: (provided) => ({
    ...provided,
    cursor: "pointer"
  })
};
var defaultOptions = ["score", "timings.asc", "updatedAt.desc"];
function Sort({ options = defaultOptions }) {
  const intl = (0, import_react_intl.useIntl)();
  const form = (0, import_react_final_form.useForm)();
  const [userSort, setUserSort] = (0, import_react.useState)(() => form.getState().values.sort);
  const orderOptions = (0, import_react.useMemo)(
    () => [
      {
        label: intl.formatMessage(messages.relevance),
        value: "score"
        // isDisabled: true
      },
      {
        label: intl.formatMessage(messages.chronological),
        value: "timings.asc"
      },
      {
        label: intl.formatMessage(messages.recentlyUpdated),
        value: "updatedAt.desc"
      },
      {
        label: intl.formatMessage(messages.publicView),
        value: "lastTimingWithFeatured.asc"
      }
    ].filter((option) => options.includes(option.value)),
    [intl, options]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_ReactSelectField.default,
      {
        Field: import_react_final_form.Field,
        name: "sort",
        options: orderOptions,
        styles: stateSelectStyles,
        isSearchable: false,
        isClearable: false,
        defaultValue: "updatedAt.desc"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_final_form_listeners.OnChange, { name: "sort", children: (value) => {
      if (form.getState().active === "sort") {
        setUserSort(value);
      }
    } }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_final_form_listeners.OnChange, { name: "search", children: (value, previousValue) => {
      const { sort } = form.getState().values;
      if (previousValue === "" && value !== "") {
        setUserSort(sort);
        form.change("sort", "score");
      } else if (sort === "score" && previousValue !== "" && value === "") {
        form.change(
          "sort",
          userSort && userSort !== "" ? userSort : void 0
        );
      }
    } })
  ] });
}
//# sourceMappingURL=Sort.cjs.map