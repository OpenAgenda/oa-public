import {
  SearchInput
} from "./chunk-V4A3XC4W.js";
import {
  FilterPreviewer
} from "./chunk-FUQD6HGF.js";

// src/components/filters/SearchFilter.js
import React, { useCallback } from "react";
import { Field, useField } from "react-final-form";
import { useUIDSeed } from "react-uid";
import { defineMessages, useIntl } from "react-intl";
import { jsx } from "@emotion/react/jsx-runtime";
var subscription = { value: true };
var messages = defineMessages({
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
  const { input } = useField(name, { subscription });
  const onRemove = useCallback(
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
  return React.createElement(component, {
    name,
    filter,
    label: input.value,
    onRemove,
    disabled,
    ...rest
  });
}
var SearchFilter = React.forwardRef(function SearchFilter2({ name, filter, component = SearchInput, placeholder = null, ...rest }, _ref) {
  const seed = useUIDSeed();
  const intl = useIntl();
  return /* @__PURE__ */ jsx(
    Field,
    {
      name,
      subscription,
      component,
      type: "text",
      filter,
      placeholder: placeholder || intl.formatMessage(messages.placeholder),
      ...rest
    },
    seed(filter)
  );
});
var exported = React.memo(SearchFilter);
exported.Preview = Preview;
var SearchFilter_default = exported;

export {
  SearchFilter_default
};
//# sourceMappingURL=chunk-2MRLBDJH.js.map