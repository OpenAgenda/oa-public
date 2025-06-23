import {
  getFilterTitle
} from "./chunk-SB23MYX5.js";

// src/hooks/useFilterTitle.js
import { useMemo } from "react";
import { useIntl } from "react-intl";
function useFilterTitle(messageKey, fieldSchema, messages) {
  const intl = useIntl();
  return useMemo(
    () => getFilterTitle(intl, messages, messageKey, fieldSchema),
    [intl, messages, messageKey, fieldSchema]
  );
}

export {
  useFilterTitle
};
//# sourceMappingURL=chunk-FHMHSQDZ.js.map