import {
  includeFields_default
} from "./chunk-RINQXU4K.js";
import {
  messages_default
} from "./chunk-D7N7YQOA.js";
import {
  EventItem
} from "./chunk-4BWOB5LX.js";

// src/components/Events/Selection.js
import qs from "qs";
import { useEffect, useState, useCallback } from "react";
import { Spinner } from "@openagenda/react-shared";
import { useIntl } from "react-intl";
import { jsx, jsxs } from "react/jsx-runtime";
function Selection({ res, value, lang, onChange }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const m = useIntl().formatMessage;
  useEffect(() => {
    const identifiers = [].concat(value).filter((v) => !!v);
    if (!identifiers.length) {
      return;
    }
    setIsLoading(true);
    fetch(
      `${res}?${qs.stringify({
        uid: identifiers,
        state: [0, 1, 2],
        includeFields: includeFields_default
      })}`
    ).then((r) => {
      setIsLoading(false);
      if (!r.ok) {
        setErrored(true);
        return;
      }
      r.json().then((data) => {
        setEvents(data.events);
      });
    });
  }, [res, value]);
  const onRemove = useCallback(
    (uidToRemove) => {
      const filteredSelection = events.filter((e) => e.uid !== uidToRemove);
      setEvents(filteredSelection);
      onChange(filteredSelection.map((e) => e.uid));
    },
    [events, onChange]
  );
  if (isLoading) {
    return /* @__PURE__ */ jsx(Spinner, {});
  }
  if (errored) {
    return /* @__PURE__ */ jsx("p", { children: m(messages_default.loadError) });
  }
  if (!events.length) {
    return /* @__PURE__ */ jsx("div", { className: "padding-all-md text-center", children: m(messages_default.emptySelection) });
  }
  return /* @__PURE__ */ jsx("ul", { className: "list-unstyled", children: events.map((event) => /* @__PURE__ */ jsx("li", { className: "margin-v-sm", children: /* @__PURE__ */ jsxs(EventItem, { event, lang, children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: `/events/${event.slug}`,
        target: "_blank",
        rel: "noreferrer",
        className: "btn btn-link padding-all-z margin-right-sm",
        children: m(messages_default.show)
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn btn-link padding-all-z text-danger",
        onClick: () => onRemove(event.uid),
        children: m(messages_default.remove)
      }
    )
  ] }) }, `selected-event-${event.uid}`)) });
}

export {
  Selection
};
//# sourceMappingURL=chunk-NSIWX63Y.js.map