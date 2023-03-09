import { useIntl } from 'react-intl';
import { Text } from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import messages from './messages';

export default function Description({ agenda }) {
  const intl = useIntl();

  return (
    <Text color="oaGray.500" mb="6">
      {intl.formatMessage(messages.subtitle, { agenda: getLocaleValue(agenda.title, intl.locale) })}
    </Text>
  );
}
