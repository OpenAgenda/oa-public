import { useIntl } from 'react-intl';

export default function Total({ message, total }) {
  const intl = useIntl();

  return intl.formatMessage(message, { total });
}
