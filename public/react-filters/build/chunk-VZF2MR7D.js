import {
  MapField_default
} from "./chunk-5Q4T46XE.js";
import {
  Panel
} from "./chunk-KLWUSN74.js";
import {
  Title
} from "./chunk-CD5KYVA4.js";
import {
  FilterPreviewer
} from "./chunk-FUQD6HGF.js";

// src/components/filters/MapFilter.js
import React, { useCallback, useState } from "react";
import { Field, useField } from "react-final-form";
import { defineMessages, useIntl } from "react-intl";
import { jsx } from "@emotion/react/jsx-runtime";
var subscription = { value: true };
var messages = defineMessages({
  previewLabel: {
    id: "ReactFilters.filters.MapFilter.previewLabel",
    defaultMessage: "Map"
  }
});
function Preview({
  name,
  filter,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = useIntl();
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
    label: intl.formatMessage(messages.previewLabel),
    onRemove,
    disabled,
    ...rest
  });
}
function MapFilter({
  name,
  filter,
  disabled,
  collapsed,
  className,
  component = MapField_default,
  ...rest
}, ref) {
  return /* @__PURE__ */ jsx(
    Field,
    {
      collapsed,
      ref,
      name,
      subscription,
      component,
      filter,
      disabled,
      className,
      ...rest
    }
  );
}
var Collapsable = React.forwardRef(function Collapsable2({ name, filter, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = useState(true);
  return /* @__PURE__ */ jsx(
    Panel,
    {
      header: /* @__PURE__ */ jsx(
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
      children: /* @__PURE__ */ jsx(
        MapFilter,
        {
          ref,
          name,
          filter,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported = React.memo(React.forwardRef(MapFilter));
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var MapFilter_default = exported;

export {
  MapFilter_default
};
//# sourceMappingURL=chunk-VZF2MR7D.js.map