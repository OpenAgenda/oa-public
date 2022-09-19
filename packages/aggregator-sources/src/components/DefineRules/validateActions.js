import React from 'react';
import { getLocaleValue } from '@openagenda/intl';
import messages from './messages';

export default function validateActions(
  intl,
  rules,
  aggregatorAgendaSchema,
  sourceSchema
) {
  const missingFields = [];

  const actions = rules.flatMap(v => v.actions?.filter(Boolean));

  aggregatorAgendaSchema.fields
    .filter(v => v.fieldType !== 'abstract')
    .forEach(fieldSchema => {
      const aggAction = actions.find(v => v.field === fieldSchema.field);
      const hasValue = Array.isArray(aggAction?.values)
        ? aggAction.values.length
        : ![null, undefined, ''].includes(aggAction?.values);
      const isAuto = !!aggAction?.automatic;

      if (!sourceSchema) {
        return;
      }

      const inSourceSchema = sourceSchema.fields?.find(
        v => v.schemaId
          && v.field === fieldSchema.field
          && v.schemaId === fieldSchema.schemaId
      );

      if (
        !inSourceSchema
        && fieldSchema.optional === false
        && !fieldSchema.enableWith
        && !aggAction
        && !(hasValue || isAuto)
      ) {
        missingFields.push(fieldSchema);
      }
    });

  if (missingFields.length) {
    return intl.formatMessage(messages.missingRequiredFields, {
      fields: intl.formatList(
        missingFields.map(v => (
          <em key={v.field}>{getLocaleValue(v.label, intl.locale)}</em>
        ))
      ),
      fieldsCount: missingFields.length,
    });
  }
}
