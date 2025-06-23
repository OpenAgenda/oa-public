import {
  ChoiceField_default
} from "./chunk-4INNYBZH.js";
import {
  choiceFilter_default
} from "./chunk-BZHZDM2U.js";
import {
  useChoiceState
} from "./chunk-GIY6BRWG.js";
import {
  Panel
} from "./chunk-KLWUSN74.js";
import {
  Title
} from "./chunk-CD5KYVA4.js";
import {
  FilterPreviewer
} from "./chunk-FUQD6HGF.js";

// src/components/filters/ChoiceFilter.js
import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect
} from "react";
import { Field, useField } from "react-final-form";
import { useUIDSeed } from "react-uid";
import { useIntl } from "react-intl";
import usePreviousModule from "react-use/lib/usePrevious.js";
import { css } from "@emotion/react";
import { Fragment, jsx, jsxs } from "@emotion/react/jsx-runtime";
var usePrevious = usePreviousModule.default || usePreviousModule;
var subscription = { value: true };
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
  const intl = useIntl();
  const { input } = useField(name, { subscription });
  const options = useMemo(() => getOptions(filter), [filter, getOptions]);
  const valueOptions = useMemo(() => {
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
  const onRemove = useCallback(
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
  return React.createElement(component, {
    name,
    filter,
    getOptions,
    valueOptions,
    onRemove,
    disabled,
    ...rest
  });
}
var ChoiceFilter = React.forwardRef(function ChoiceFilter2({
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
  const intl = useIntl();
  const seed = useUIDSeed();
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
  const newOptionRef = useRef(null);
  const previousCountOptions = usePrevious(countOptions);
  useEffect(() => {
    if (newOptionRef.current && countOptions !== previousCountOptions && countOptions - pageSize === previousCountOptions) {
      newOptionRef.current.focus();
    }
  }, [countOptions, previousCountOptions]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    options.length > searchMinSize ? /* @__PURE__ */ jsx(
      "input",
      {
        className: "form-control input-sm margin-top-xs",
        value: searchValue,
        onChange: onSearchChange,
        placeholder: searchPlaceholder || intl.formatMessage(choiceFilter_default.searchPlaceholder),
        "aria-label": searchAriaLabel,
        title: searchAriaLabel,
        css: css`
            width: 50%;
          `
      }
    ) : null,
    foundOptions.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-muted margin-v-xs", children: intl.formatMessage(choiceFilter_default.noResult) }) : null,
    foundOptions.map((option, index) => index < countOptions ? /* @__PURE__ */ jsx(
      Field,
      {
        name,
        subscription,
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
    hasMoreOptions ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn btn-link btn-link-inline",
        onClick: moreOptions,
        children: intl.formatMessage(choiceFilter_default.moreOptions)
      }
    ) : null,
    !hasMoreOptions && countOptions > pageSize ? /* @__PURE__ */ jsx(
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
var Collapsable = React.forwardRef(function Collapsable2({ name, filter, component, getTotal, getOptions, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = useState(filter.defaultCollapsed ?? true);
  return /* @__PURE__ */ jsx(
    Panel,
    {
      header: /* @__PURE__ */ jsx(
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
      children: /* @__PURE__ */ jsx(
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
var exported = React.memo(ChoiceFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var ChoiceFilter_default = exported;

export {
  ChoiceFilter_default
};
//# sourceMappingURL=chunk-SA3WJCAL.js.map