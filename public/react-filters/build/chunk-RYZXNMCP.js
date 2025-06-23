import {
  locales_compiled_exports
} from "./chunk-UZRB7FQF.js";

// src/components/IntlProvider.js
import { useMemo } from "react";
import { IntlProvider as ReactIntlProvider } from "react-intl";
import { getSupportedLocale, mergeLocales } from "@openagenda/intl";
import { jsx } from "@emotion/react/jsx-runtime";
function IntlProvider({ locale, userLocales = null, children }) {
  const locales = useMemo(
    () => mergeLocales(locales_compiled_exports, userLocales || {}),
    [userLocales]
  );
  return /* @__PURE__ */ jsx(
    ReactIntlProvider,
    {
      locale,
      messages: locales[locale],
      defaultLocale: getSupportedLocale(locale),
      children
    },
    locale
  );
}

export {
  IntlProvider
};
//# sourceMappingURL=chunk-RYZXNMCP.js.map