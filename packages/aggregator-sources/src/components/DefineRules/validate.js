import _ from 'lodash';
import { FORM_ERROR } from 'final-form';
import { combineDateTime } from '../../utils/timings.js';
import messages from './messages.js';

export default function validate(
  intl,
  values,
  aggregatorAgendaSchema /* , sourceSchema */,
) {
  const errors = {};
  if (values.withFilter && !values.type) {
    errors.type = intl.formatMessage(messages.requiredType);
  }

  if (values.type === 'location' && !values.subdivision) {
    errors.subdivision = intl.formatMessage(messages.requiredSubdivision);
  }

  if (values.type === 'choice' && !values.choiceValues) {
    errors.choiceValues = intl.formatMessage(messages.requiredValues);
  }

  if (values.type === 'location' && !values.locationValues) {
    errors.locationValues = intl.formatMessage(messages.requiredValues);
  }

  if (values.type === 'tags' && !values.tagValues) {
    errors.tagValues = intl.formatMessage(messages.requiredValues);
  }

  // featuredValue is a boolean, so `false` is a valid choice: only flag it
  // missing when truly undefined.
  if (values.type === 'featured' && typeof values.featuredValue === 'undefined') {
    errors.featuredValue = intl.formatMessage(messages.requiredValues);
  }

  if (values.type === 'timings') {
    if (
      !values.timings.minDate
      || !values.timings.minTime
      || !values.timings.maxDate
      || !values.timings.maxTime
    ) {
      errors.timings = intl.formatMessage(messages.requiredValues);
    } else {
      const gte = combineDateTime(
        values.timings.minDate,
        values.timings.minTime,
      );
      const lte = combineDateTime(
        values.timings.maxDate,
        values.timings.maxTime,
      );
      if (gte > lte) {
        errors.timings = intl.formatMessage(messages.startAfterEnd);
      }
    }
  }

  const hasSomeActions = values.withActions
    && values.actions?.some((v) => !['', null, undefined].includes(v.field));

  if (!hasSomeActions) {
    if (values.type === 'all') {
      errors[FORM_ERROR] = intl.formatMessage(messages.uselessRule);
    } else if (!values.required) {
      errors[FORM_ERROR] = intl.formatMessage(messages.uselessRuleWithFilter);
    }
  }

  aggregatorAgendaSchema.fields
    .filter((v) => v.fieldType !== 'abstract')
    .concat({
      field: 'state',
      optional: false,
    })
    .forEach((fieldSchema) => {
      const aggActionIndex = values.actions?.findIndex(
        (v) => v?.field && v.field === fieldSchema.field,
      );
      const aggAction = values.actions?.[aggActionIndex];

      const hasValue = Array.isArray(aggAction?.values)
        ? aggAction.values.length
        : ![null, undefined, ''].includes(aggAction?.values)
          || ![null, undefined, ''].includes(aggAction?.copyValues);
      const isAuto = aggAction?.automatic;

      if (
        fieldSchema.optional === false
        && aggAction
        && !(hasValue || isAuto)
      ) {
        _.set(
          errors,
          ['actions', aggActionIndex, 'values'],
          intl.formatMessage(messages.requiredValues),
        );
      }
    });

  if (Object.keys(errors).length) {
    return errors;
  }
}
