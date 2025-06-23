var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/hooks/useFavoritesOnChange.js
var useFavoritesOnChange_exports = {};
__export(useFavoritesOnChange_exports, {
  default: () => useFavoritesOnChange
});
module.exports = __toCommonJS(useFavoritesOnChange_exports);
var import_react = require("react");
var import_react_final_form = require("react-final-form");

// src/utils/matchQuery.js
var import_isMatch = __toESM(require("lodash/isMatch.js"), 1);
var import_omitBy = __toESM(require("lodash/omitBy.js"), 1);
var import_isEmpty = __toESM(require("lodash/isEmpty.js"), 1);
function matchQuery(a, b) {
  return (0, import_isMatch.default)((0, import_omitBy.default)(a, import_isEmpty.default), (0, import_omitBy.default)(b, import_isEmpty.default));
}

// src/utils/updateFormValues.js
function updateFormValues(form, query, active = true) {
  form.batch(() => {
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (active) {
          form.change(key, query[key]);
        } else {
          form.change(key, void 0);
        }
      }
    }
  });
}

// src/hooks/useFavoritesOnChange.js
function useFavoritesOnChange(eventUids, { isExclusive } = {}) {
  const form = (0, import_react_final_form.useForm)();
  return (0, import_react.useCallback)(
    (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      const query = form.getState().values;
      const matchingQuery = {
        uid: (eventUids == null ? void 0 : eventUids.length) ? eventUids.map(String) : ["-1"],
        favorites: "1"
      };
      const isMatchQuery = matchQuery(query, matchingQuery);
      const newQuery = isExclusive && !isMatchQuery ? form.getRegisteredFields().reduce((accu, next) => {
        if (next in matchingQuery) {
          accu[next] = matchingQuery[next];
          return accu;
        }
        accu[next] = void 0;
        return accu;
      }, {}) : matchingQuery;
      if (!((_a = newQuery.uid) == null ? void 0 : _a.length)) {
        newQuery.uid = ["-1"];
      }
      updateFormValues(form, newQuery, !isMatchQuery);
    },
    [isExclusive, form, eventUids]
  );
}
//# sourceMappingURL=useFavoritesOnChange.cjs.map