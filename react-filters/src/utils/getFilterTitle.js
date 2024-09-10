import { getLocaleValue } from '@openagenda/intl';
import defaultMessages from '../messages/filterTitles';

export default function getFilterTitle(
  intl,
  providedMessages,
  messageKey,
  fieldSchema,
) {
  const messages = providedMessages ?? defaultMessages;

  if (fieldSchema?.label) {
    return getLocaleValue(fieldSchema.label, intl.locale);
  }

  if (messages[messageKey]) {
    return intl.formatMessage(messages[messageKey]);
  }

  return messageKey;
}
