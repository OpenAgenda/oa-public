// src/components/Panel.js
import { useMemo, useState } from "react";
import cn from "classnames";
import a11yButtonActionHandler from "@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js";
import { jsx, jsxs } from "@emotion/react/jsx-runtime";
function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children
}) {
  const internalState = useState(collapsed);
  const value = typeof setCollapsed === "function" ? collapsed : internalState[0];
  const updater = typeof setCollapsed === "function" ? setCollapsed : internalState[1];
  const toggleCollapsed = useMemo(
    () => a11yButtonActionHandler((e) => {
      e.preventDefault();
      updater((v) => !v);
    }),
    [updater]
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn("oa-collapse-item", { "oa-collapse-item-active": !value }),
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "oa-collapse-header",
            role: "tab",
            tabIndex: "0",
            "aria-expanded": !value,
            onClick: toggleCollapsed,
            onKeyPress: toggleCollapsed,
            children: [
              header,
              /* @__PURE__ */ jsx("span", { className: "oa-collapse-arrow", children: /* @__PURE__ */ jsx(
                "i",
                {
                  className: cn("fa fa-lg", {
                    "fa-angle-up": !value,
                    "fa-angle-down": value
                  }),
                  "aria-hidden": "true"
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn("oa-collapse-content", {
              "oa-collapse-content-active": !value,
              "oa-collapse-content-inactive": value
            }),
            role: "tabpanel",
            children: /* @__PURE__ */ jsx("div", { className: "oa-collapse-content-box", children })
          }
        )
      ]
    }
  );
}

export {
  Panel
};
//# sourceMappingURL=chunk-KLWUSN74.js.map