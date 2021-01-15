import getLocaleValue from './getLocaleValue';

export default function getFilterTitle(
  intl,
  messages,
  messageKey,
  fieldSchema
) {
  if (fieldSchema?.label) {
    return getLocaleValue(fieldSchema.label, intl.locale);
  }

  if (messages[messageKey]) {
    return intl.formatMessage(messages[messageKey]);
  }

  return messageKey;
}
