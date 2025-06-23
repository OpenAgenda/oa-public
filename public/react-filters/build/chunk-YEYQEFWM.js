// src/components/ValueBadge.js
import classNames from "classnames";
import { defineMessages, useIntl } from "react-intl";
import { css } from "@emotion/react";
import { getLocaleValue } from "@openagenda/intl";
import { jsx, jsxs } from "@emotion/react/jsx-runtime";
var messages = defineMessages({
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
  const intl = useIntl();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages.removeFilterWithTitle, { title }) : intl.formatMessage(messages.removeFilter);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: classNames("btn badge badge-pill badge-info margin-right-xs", {
        disabled
      }),
      css: css`
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
        getLocaleValue(label, intl.locale),
        "\xA0",
        /* @__PURE__ */ jsx("i", { className: "fa fa-times", "aria-hidden": "true" })
      ]
    }
  );
}

export {
  ValueBadge
};
//# sourceMappingURL=chunk-YEYQEFWM.js.map