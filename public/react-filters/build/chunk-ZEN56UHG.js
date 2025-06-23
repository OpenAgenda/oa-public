// src/hooks/useFavoriteState.js
import { useCallback } from "react";
import { createLocalStorageStateHook } from "use-local-storage-state";
var useFavoriteLocalStorageState = createLocalStorageStateHook("favorite-events");
function useFavoriteState(agendaUid) {
  const [value, setValue] = useFavoriteLocalStorageState();
  const setAgendaValue = useCallback(
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

export {
  useFavoriteState
};
//# sourceMappingURL=chunk-ZEN56UHG.js.map