// src/components/fields/ChoiceField.js
import React, { useMemo, useRef } from "react";
import { useUIDSeed } from "react-uid";
import { useIntl } from "react-intl";
import cn from "classnames";
import { getLocaleValue } from "@openagenda/intl";
import a11yButtonActionHandler from "@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js";
import { Fragment, jsx, jsxs } from "@emotion/react/jsx-runtime";
function useOnChoiceChange(input, preventDefault) {
  const inputRef = useRef();
  const onChange = useMemo(
    () => a11yButtonActionHandler((e) => {
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
var ChoiceField = React.forwardRef(function ChoiceField2({
  input,
  getTotal,
  filter,
  option,
  disabled,
  tag: Tag = "div",
  preventDefault = true
}, ref) {
  const intl = useIntl();
  const seed = useUIDSeed();
  const total = useMemo(
    () => getTotal == null ? void 0 : getTotal(filter, option),
    [filter, getTotal, option]
  );
  const { inputRef, onChange } = useOnChoiceChange(input, preventDefault);
  return /* @__PURE__ */ jsx(
    Tag,
    {
      className: cn(input.type, {
        disabled,
        active: input.checked,
        inactive: !input.checked
      }),
      children: /* @__PURE__ */ jsxs(
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
            /* @__PURE__ */ jsx(
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
            getLocaleValue(option.label, intl.locale) || /* @__PURE__ */ jsx(Fragment, { children: "\xA0" }),
            Number.isInteger(total) && total !== 0 ? /* @__PURE__ */ jsx("span", { className: "oa-filter-total", children: total }) : null
          ]
        }
      )
    }
  );
});
var ChoiceField_default = ChoiceField;

export {
  ChoiceField_default
};
//# sourceMappingURL=chunk-4INNYBZH.js.map