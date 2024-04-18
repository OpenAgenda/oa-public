import { useIntl } from 'react-intl';

export default function Total({
  message,
  total,
  totalLabel,
  totalLabelPlural,
}) {
  const intl = useIntl();

  return intl.formatMessage(message, { total, totalLabel, totalLabelPlural });
}
