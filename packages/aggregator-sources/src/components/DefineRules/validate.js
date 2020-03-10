import _ from 'lodash';
import { FORM_ERROR } from 'final-form';
import messages from './messages';

export default function validate(
  intl,
  values,
  aggregatorAgendaSchema /* , sourceSchema */
) {
  const errors = {};

  if (values.withFilter && !values.type) {
    errors.type = intl.formatMessage(messages.requiredType);
  }

  if (values.type === 'location' && !values.subdivision) {
    errors.subdivision = intl.formatMessage(messages.requiredSubdivision);
  }

  if (values.type === 'extended' && !values.extendedValues) {
    errors.extendedValues = intl.formatMessage(messages.requiredValues);
  }

  if (values.type === 'location' && !values.locationValues) {
    errors.locationValues = intl.formatMessage(messages.requiredValues);
  }

  if (values.type === 'tags' && !values.tagValues) {
    errors.tagValues = intl.formatMessage(messages.requiredValues);
  }

  const hasSomeActions = values.withActions
    && values.actions?.some(v => !['', null, undefined].includes(v.field));

  if (!hasSomeActions) {
    if (values.type === 'all') {
      errors[FORM_ERROR] = intl.formatMessage(messages.uselessRule);
    } else if (!values.required) {
      errors[FORM_ERROR] = "Une règle d'agrégation avec filtre non requis doit comporter au moins une action";
    }
  }

  aggregatorAgendaSchema.fields
    .filter(v => v.fieldType !== 'abstract')
    .concat({
      field: 'state',
      optional: false
    })
    .forEach(fieldSchema => {
      const aggActionIndex = values.actions?.findIndex(
        v => v?.field && v.field === fieldSchema.field
      );
      const aggAction = values.actions?.[aggActionIndex];

      const hasValue = Array.isArray(aggAction?.values)
        ? aggAction.values.length
        : ![null, undefined, ''].includes(aggAction?.values);
      const isAuto = aggAction?.automatic;

      if (
        fieldSchema.optional === false
        && aggAction
        && !(hasValue || isAuto)
      ) {
        _.set(
          errors,
          ['actions', aggActionIndex, 'values'],
          intl.formatMessage(messages.requiredValues)
        );
      }
    });

  if (Object.keys(errors).length) {
    return errors;
  }
}
