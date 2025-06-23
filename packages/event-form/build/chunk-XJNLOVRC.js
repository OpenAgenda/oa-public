import {
  includeFields_default
} from "./chunk-RINQXU4K.js";
import {
  messages_default
} from "./chunk-D7N7YQOA.js";
import {
  EventItem
} from "./chunk-4BWOB5LX.js";

// src/components/Events/Add.js
import { useCallback, useEffect, useState, createRef } from "react";
import { useDebounce } from "use-debounce";
import cn from "classnames";
import qs from "qs";
import { Spinner } from "@openagenda/react-shared";
import { useIntl } from "react-intl";
import { jsx, jsxs } from "react/jsx-runtime";
function Add({ res, value, lang, onChange }) {
  const [searchString, setSearchString] = useState("");
  const [userHasSearched, setUserHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState(void 0);
  const [debouncedSearch] = useDebounce(searchString, 1e3);
  const [isLoading, setIsLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const m = useIntl().formatMessage;
  useEffect(() => {
    if (!userHasSearched) {
      return;
    }
    setIsLoading(true);
    fetch(
      `${res}?${qs.stringify({
        search: debouncedSearch,
        state: [0, 1, 2],
        relative: ["current", "upcoming"],
        includeFields: includeFields_default
      })}`
    ).then((response) => {
      setIsLoading(false);
      if (!response.ok) {
        setErrored(true);
        return;
      }
      setDisplayDropdown(true);
      response.json().then(setSearchResult);
    });
  }, [debouncedSearch, res, userHasSearched]);
  const onSearchChange = useCallback(
    (e) => {
      var _a;
      setSearchString(e.target.value);
      if (!userHasSearched && ((_a = e.target.value) == null ? void 0 : _a.length)) {
        setUserHasSearched(true);
      }
    },
    [userHasSearched]
  );
  const ref = createRef();
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setDisplayDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
  if (errored) {
    return /* @__PURE__ */ jsx("p", { children: m(messages_default.loadError) });
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("dropdown", { open: displayDropdown }), children: [
    /* @__PURE__ */ jsxs("div", { className: "input-group", children: [
      /* @__PURE__ */ jsx("label", { className: "sr-only", htmlFor: "search", children: m(messages_default.searchEvents) }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "search",
          type: "text",
          className: "form-control",
          placeholder: m(messages_default.searchEvents),
          autoComplete: "off",
          onChange: onSearchChange
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "input-group-btn", children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-default",
          type: "button",
          "aria-label": m(messages_default.search),
          children: /* @__PURE__ */ jsx(
            "i",
            {
              className: "fa fa-search",
              "aria-hidden": "true",
              style: { display: "block", height: "20px", paddingTop: "4px" }
            }
          )
        }
      ) })
    ] }),
    isLoading ? /* @__PURE__ */ jsx(Spinner, {}) : null,
    displayDropdown ? /* @__PURE__ */ jsxs("ul", { ref, className: "dropdown-menu", children: [
      !((searchResult == null ? void 0 : searchResult.events) ?? []).length ? /* @__PURE__ */ jsx("li", { className: "padding-v-sm", children: /* @__PURE__ */ jsx("div", { className: "media text-center disabled", children: m(messages_default.noResult) }) }, "search-result-empty") : null,
      ((searchResult == null ? void 0 : searchResult.events) ?? []).map((event) => /* @__PURE__ */ jsx("li", { className: "padding-v-sm", children: /* @__PURE__ */ jsx("div", { className: "media", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-link btn-block",
          onClick: () => {
            onChange((value ?? []).concat(event.uid));
            setDisplayDropdown(false);
          },
          disabled: (value ?? []).includes(event.uid),
          children: /* @__PURE__ */ jsx(EventItem, { lang, event })
        }
      ) }) }, `search-result-${event.uid}`))
    ] }) : null
  ] });
}

export {
  Add
};
//# sourceMappingURL=chunk-XJNLOVRC.js.map