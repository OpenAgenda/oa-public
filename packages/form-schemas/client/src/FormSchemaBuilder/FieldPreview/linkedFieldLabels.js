import { getLocaleValue } from '@openagenda/intl';

import {
  getLabel,
  getLinkedField,
} from './utils';

export function getSummary({
  field,
  lang,
  schema,
}) {
  const linkedField = getLinkedField({ field, schema });

  return getLabel('linkedTo', {
    fieldName: getLocaleValue(linkedField.label, lang),
  }, lang);
}
