'use strict';

const log = require('@openagenda/logs')('utils/rules');

const ih = require('immutability-helper');
const evaluateRule = require('./evaluateRule');
const cleanRule = require('./clean');
const convertFieldOptionIdsToLabels = require('./convertFieldOptionIdsToLabels');

function evaluateRules(
  rules,
  sourceAgendaSchema,
  aggregatorAgendaSchema,
  data,
) {
  const actions = [];

  log('evaluating %s rules', rules?.length ?? 0);

  for (const rule of [].concat(rules)) {
    const ruleActions = evaluateRule(
      cleanRule(rule),
      sourceAgendaSchema,
      aggregatorAgendaSchema,
      data,
    );

    if (ruleActions === false) {
      return {
        stop: true,
        actions: [],
      };
    }
    if (ruleActions) {
      ruleActions.forEach(a => actions.push(a));
    }
  }

  return {
    stop: false,
    actions,
  };
}

function forceExplicitActionOperation(action, forceOperation = null) {
  const currentOperation = Object.keys(action.values || {}).shift();
  const actionHasOperation = ['$set', '$push'].includes(currentOperation);

  const actionValues = actionHasOperation
    ? action.values[currentOperation]
    : action.values;

  if (forceOperation) {
    return {
      ...action,
      values: { [forceOperation]: actionValues },
    };
  }
  if (!currentOperation) {
    return {
      ...action,
      values: { $push: actionValues },
    };
  }

  return action;
}

function extractAutomaticValues(
  sourceAgendaSchema,
  aggregatorAgendaSchema,
  aggregatorFieldName,
  data,
) {
  const sourceFieldsWithData = Object.keys(data);
  const optionedSourceFieldsWithData = sourceAgendaSchema.fields.filter(
    f => !!f.options && sourceFieldsWithData.includes(f.field),
  );

  const labels = optionedSourceFieldsWithData.reduce(
    (result, sourceField) => result.concat(
      convertFieldOptionIdsToLabels(sourceField, data[sourceField.field]),
    ),
    [],
  );

  if (!labels.length) return [];

  const aggregatorField = aggregatorAgendaSchema.fields
    .filter(f => f.field === aggregatorFieldName)
    .pop();

  if (!aggregatorField) return [];

  const aggregatorOptionIdsByLabel = aggregatorField.options.reduce(
    (result, option) => {
      const optionLabels = typeof option.label === 'string'
        ? [option.label]
        : Object.values(option.label);
      return optionLabels.reduce(
        (accu, label) => ({
          ...accu,
          [label]: option.id,
        }),
        result,
      );
    },
    {},
  );

  return labels
    .map(l => aggregatorOptionIdsByLabel[l])
    .filter(id => !!id)
    .reduce(
      (deduped, id) => (deduped.includes(id) ? deduped : [...deduped, id]),
      [],
    );
}

module.exports = (rules, sourceAgendaSchema, aggregatorAgendaSchema, data) => {
  const { stop, actions } = evaluateRules(
    rules,
    sourceAgendaSchema,
    aggregatorAgendaSchema,
    data,
  );

  if (stop) {
    return null;
  }

  const actionsByField = actions.reduce((result, action) => {
    if (!result[action.field]) {
      // is first action of field. must be $set
      result[action.field] = [forceExplicitActionOperation(action, '$set')];
    } else {
      result[action.field].push(forceExplicitActionOperation(action));
    }
    return result;
  }, {});

  // pick values common between two schemas as base for response
  const base = aggregatorAgendaSchema && sourceAgendaSchema
    ? aggregatorAgendaSchema.fields.reduce(
      (result, aggregatorSchemaField) => {
        const fieldName = aggregatorSchemaField.field;
        const matchingSourceField = sourceAgendaSchema.fields
          .filter(f => f.schemaId === aggregatorSchemaField.schemaId)
          .pop();

        if (!matchingSourceField) return result;
        if (data[fieldName] === undefined) return result;

        return {
          ...result,
          [aggregatorSchemaField.field]: data[fieldName],
        };
      },
      {},
    )
    : {};

  // reduce to one transform per field
  const transform = Object.keys(actionsByField).reduce(
    (result, field) => ({
      ...result,
      [field]: actionsByField[field].reduce((fieldTransform, action) => {
        const actionOperation = Object.keys(action.values).pop();
        const fieldOperation = Object.keys(fieldTransform).pop();
        const actionValues = action.automatic
          ? extractAutomaticValues(
            sourceAgendaSchema,
            aggregatorAgendaSchema,
            field,
            data,
          )
          : action.values[actionOperation];

        const currentFieldTransformValues = [].concat(
          fieldTransform[fieldOperation],
        );
        const updatedFieldTransformValues = actionOperation === '$set'
          ? actionValues
          : (currentFieldTransformValues || []).concat(actionValues);

        return {
          [actionOperation === '$set' ? actionOperation : fieldOperation]:
            updatedFieldTransformValues,
        };
      }, {}),
    }),
    {},
  );

  return ih(base, transform);
};
