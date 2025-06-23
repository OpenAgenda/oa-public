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

// src/components/fields/SearchInput.js
var SearchInput_exports = {};
__export(SearchInput_exports, {
  default: () => SearchInput
});
module.exports = __toCommonJS(SearchInput_exports);
var import_react2 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");
var import_use_debounce = require("use-debounce");
var import_react_intl = require("react-intl");

// src/contexts/FiltersAndWidgetsContext.js
var import_react = require("react");
var FiltersAndWidgetsContext = (0, import_react.createContext)({
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
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl.defineMessages)({
  ariaLabel: {
    id: "ReactFilters.components.fields.SearchInput.ariaLabel",
    defaultMessage: "Search"
  }
});
function Input({ input, placeholder, ariaLabel, onButtonClick, manualSubmit }) {
  const intl = (0, import_react_intl.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "input-group mb-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
    !manualSubmit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "input-group-append", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "submit",
        className: "btn btn-outline-secondary",
        onClick: onButtonClick,
        "aria-label": intl.formatMessage(messages.ariaLabel),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa fa-search", "aria-hidden": "true" })
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
  const [tmpValue, setTmpValue] = (0, import_react2.useState)(input.value);
  const {
    filtersOptions: { manualSubmit }
  } = (0, import_react2.useContext)(FiltersAndWidgetsContext_default);
  const debouncedOnChange = (0, import_use_debounce.useDebouncedCallback)((e) => {
    if (manualSearch) {
      return;
    }
    input.onChange(e);
    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  }, 400);
  const inputOnChange = (0, import_react2.useCallback)(
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
  const onButtonClick = (0, import_react2.useCallback)(
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
  const wrappedInput = (0, import_react2.useMemo)(
    () => ({
      ...input,
      value: tmpValue,
      onChange: inputOnChange
    }),
    [input, inputOnChange, tmpValue]
  );
  (0, import_react2.useEffect)(() => {
    setTmpValue(input.value);
  }, [input.value]);
  return import_react2.default.createElement(inputComponent, {
    input: wrappedInput,
    onButtonClick,
    manualSubmit,
    ...rest
  });
}
//# sourceMappingURL=SearchInput.cjs.map