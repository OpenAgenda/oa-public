import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { getFilterTitle } from '../utils/index.js';

export default function useFilterTitle(messageKey, fieldSchema, messages) {
  const intl = useIntl();

  return useMemo(
    () => getFilterTitle(intl, messages, messageKey, fieldSchema),
    [intl, messages, messageKey, fieldSchema],
  );
}
