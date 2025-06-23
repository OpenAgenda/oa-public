import {
  updateFormValues
} from "./chunk-DBSXZZVL.js";
import {
  matchQuery
} from "./chunk-JCQAUF4W.js";

// src/hooks/useFavoritesOnChange.js
import { useCallback } from "react";
import { useForm } from "react-final-form";
function useFavoritesOnChange(eventUids, { isExclusive } = {}) {
  const form = useForm();
  return useCallback(
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

export {
  useFavoritesOnChange
};
//# sourceMappingURL=chunk-2UQN5EMM.js.map