var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/fields/MapField/SearchHereControl.js
var SearchHereControl_exports = {};
__export(SearchHereControl_exports, {
  default: () => SearchHereControl
});
module.exports = __toCommonJS(SearchHereControl_exports);
var import_react = require("@emotion/react");
var import_react_intl2 = require("react-intl");

// src/messages/map.js
var import_react_intl = require("react-intl");
var map_default = (0, import_react_intl.defineMessages)({
  searchHere: {
    id: "ReactFilters.messages.map.searchHere",
    defaultMessage: "Search here"
  }
});

// src/components/fields/MapField/SearchHereControl.js
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
function SearchHereControl({ searchHere }) {
  const intl = (0, import_react_intl2.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      css: import_react.css`
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 400;
      `,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          onClick: searchHere,
          css: import_react.css`
          outline: none;
          overflow: hidden;
          transition-duration: 0.2s;
          cursor: pointer;
          background: white;
          height: 24px;
          border-radius: 16px;
          padding: 0px 12px;
          box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 8px 0px;
          border: 0px;

          &:hover {
            background-color: #f3f3f3;
          }

          &:active {
            background-color: #eaeaea;
          }
        `,
          children: intl.formatMessage(map_default.searchHere)
        }
      )
    }
  );
}
//# sourceMappingURL=SearchHereControl.cjs.map