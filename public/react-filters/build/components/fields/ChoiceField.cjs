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

// src/components/fields/ChoiceField.js
var ChoiceField_exports = {};
__export(ChoiceField_exports, {
  default: () => ChoiceField_default
});
module.exports = __toCommonJS(ChoiceField_exports);
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
//# sourceMappingURL=ChoiceField.cjs.map