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

// src/hooks/useFavoriteState.js
var useFavoriteState_exports = {};
__export(useFavoriteState_exports, {
  default: () => useFavoriteState
});
module.exports = __toCommonJS(useFavoriteState_exports);
var import_react = require("react");
var import_use_local_storage_state = require("use-local-storage-state");
var useFavoriteLocalStorageState = (0, import_use_local_storage_state.createLocalStorageStateHook)("favorite-events");
function useFavoriteState(agendaUid) {
  const [value, setValue] = useFavoriteLocalStorageState();
  const setAgendaValue = (0, import_react.useCallback)(
    (fnOrValue) => {
      if (typeof fnOrValue === "function") {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue(prev == null ? void 0 : prev[agendaUid])
        }));
      } else {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue
        }));
      }
    },
    [setValue, agendaUid]
  );
  return [value == null ? void 0 : value[agendaUid], setAgendaValue];
}
//# sourceMappingURL=useFavoriteState.cjs.map