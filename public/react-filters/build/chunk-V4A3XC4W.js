import {
  FiltersAndWidgetsContext_default
} from "./chunk-KG7QE6MN.js";

// src/components/fields/SearchInput.js
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useForm } from "react-final-form";
import { useDebouncedCallback } from "use-debounce";
import { defineMessages, useIntl } from "react-intl";
import { jsx, jsxs } from "@emotion/react/jsx-runtime";
var messages = defineMessages({
  ariaLabel: {
    id: "ReactFilters.components.fields.SearchInput.ariaLabel",
    defaultMessage: "Search"
  }
});
function Input({ input, placeholder, ariaLabel, onButtonClick, manualSubmit }) {
  const intl = useIntl();
  return /* @__PURE__ */ jsxs("div", { className: "input-group mb-3", children: [
    /* @__PURE__ */ jsx(
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
    !manualSubmit ? /* @__PURE__ */ jsx("div", { className: "input-group-append", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        className: "btn btn-outline-secondary",
        onClick: onButtonClick,
        "aria-label": intl.formatMessage(messages.ariaLabel),
        children: /* @__PURE__ */ jsx("i", { className: "fa fa-search", "aria-hidden": "true" })
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
  const form = useForm();
  const [tmpValue, setTmpValue] = useState(input.value);
  const {
    filtersOptions: { manualSubmit }
  } = useContext(FiltersAndWidgetsContext_default);
  const debouncedOnChange = useDebouncedCallback((e) => {
    if (manualSearch) {
      return;
    }
    input.onChange(e);
    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  }, 400);
  const inputOnChange = useCallback(
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
  const onButtonClick = useCallback(
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
  const wrappedInput = useMemo(
    () => ({
      ...input,
      value: tmpValue,
      onChange: inputOnChange
    }),
    [input, inputOnChange, tmpValue]
  );
  useEffect(() => {
    setTmpValue(input.value);
  }, [input.value]);
  return React.createElement(inputComponent, {
    input: wrappedInput,
    onButtonClick,
    manualSubmit,
    ...rest
  });
}

export {
  SearchInput
};
//# sourceMappingURL=chunk-V4A3XC4W.js.map