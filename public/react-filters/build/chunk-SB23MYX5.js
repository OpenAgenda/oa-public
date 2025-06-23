import {
  filterTitles_default
} from "./chunk-ZS6R5X2P.js";

// src/utils/getFilterTitle.js
import { getLocaleValue } from "@openagenda/intl";
function getFilterTitle(intl, providedMessages, messageKey, fieldSchema) {
  const messages = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return getLocaleValue(fieldSchema.label, intl.locale);
  }
  if (messages[messageKey]) {
    return intl.formatMessage(messages[messageKey]);
  }
  return messageKey;
}

export {
  getFilterTitle
};
//# sourceMappingURL=chunk-SB23MYX5.js.map