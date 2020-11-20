import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import getLocaleValue from '../utils/getLocaleValue';
import titleMessages from '../messages/filterTitles';

export function getFilterTitle(messageKey, fieldSchema, intl) {
  if (fieldSchema?.label) {
    return getLocaleValue(fieldSchema.label, intl.locale);
  }

  if (titleMessages[messageKey]) {
    return intl.formatMessage(titleMessages[messageKey]);
  }

  return messageKey;
}

export default function useFilterTitle(messageKey, fieldSchema) {
  const intl = useIntl();

  return useMemo(() => getFilterTitle(messageKey, fieldSchema, intl), [
    intl,
    messageKey,
    fieldSchema
  ]);
}
