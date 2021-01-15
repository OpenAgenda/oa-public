import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import getFilterTitle from '../utils/getFilterTitle';
import defaultTitleMessages from '../messages/filterTitles';

export default function useFilterTitle(
  messageKey,
  fieldSchema,
  messages = defaultTitleMessages
) {
  const intl = useIntl();

  return useMemo(
    () => getFilterTitle(intl, messages, messageKey, fieldSchema),
    [intl, messages, messageKey, fieldSchema]
  );
}
