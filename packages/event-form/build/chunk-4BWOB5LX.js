// src/components/Events/EventItem.js
import { Children } from "react";
import { EventState } from "@openagenda/react-shared";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var flatten = (value, lang) => typeof value === "string" ? value : (value ?? {})[lang] ?? (value ?? {})[Object.keys(value || {}).shift()];
function EventItem({ event, lang, children }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("strong", { className: "margin-right-xs", children: flatten(event.title, lang) }),
    event.state !== 2 ? /* @__PURE__ */ jsx(EventState, { value: event.state, displayLabel: false }) : null,
    /* @__PURE__ */ jsx("div", { children: flatten(event.dateRange, lang) }),
    Children.count(children) > 0 ? /* @__PURE__ */ jsx("div", { children: Children.map(children, (child) => child) }) : null
  ] });
}

export {
  EventItem
};
//# sourceMappingURL=chunk-4BWOB5LX.js.map