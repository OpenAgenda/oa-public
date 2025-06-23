// src/components/Total.js
import { useIntl } from "react-intl";
function Total({
  message,
  total,
  totalLabel,
  totalLabelPlural
}) {
  const intl = useIntl();
  return intl.formatMessage(message, { total, totalLabel, totalLabelPlural });
}

export {
  Total
};
//# sourceMappingURL=chunk-UPWQXRFP.js.map