'use strict';

const _ = require('lodash');
const ih = require( 'immutability-helper' );
const evaluateRule = require('./evaluateRule');
const cleanRule = require('./clean');
const convertFieldOptionIdsToLabels = require('./convertFieldOptionIdsToLabels');

module.exports = (rules, sourceAgendaSchema, aggregatorAgendaSchema, data) => {
  const actions = [];

  for (const rule of [].concat(rules)) {
    const ruleActions = evaluateRule(cleanRule(rule), sourceAgendaSchema, aggregatorAgendaSchema, data);

    if (ruleActions === false) {
      return null;
    } else if (ruleActions) {
      ruleActions.forEach(a => actions.push(a));
    }
  }

  const actionsByField = actions.reduce((actionsByField, action) => {
    if (!actionsByField[action.field]) {
      // is first action of field. must be $set
      actionsByField[action.field] = [forceExplicitActionOperation(action, '$set')];
    } else {
      actionsByField[action.field].push(
        forceExplicitActionOperation(action)
      );
    }
    return actionsByField;
  }, {});

  // pick values common between two schemas as base for response
  const base = aggregatorAgendaSchema && sourceAgendaSchema ? aggregatorAgendaSchema.fields.reduce((base, aggregatorSchemaField) => {
    const fieldName = aggregatorSchemaField.field;
    const matchingSourceField = sourceAgendaSchema.fields
      .filter(f => f.schemaId === aggregatorSchemaField.schemaId).pop();

    if (!matchingSourceField) return base;
    if (data[fieldName] === undefined) return base;

    return {
      ...base,
      [aggregatorSchemaField.field]: data[fieldName]
    }
  }, {}) : {};


  // reduce to one transform per field
  const transform = Object.keys(actionsByField).reduce((transform, field) => ({
    ...transform,
    [field]: actionsByField[field].reduce((fieldTransform, action) => {
      const actionOperation = Object.keys(action.values).pop();
      const fieldOperation = Object.keys(fieldTransform).pop();
      const actionValues = action.automatic ?
        extractAutomaticValues(sourceAgendaSchema, aggregatorAgendaSchema, field, data)
        : action.values[actionOperation];

      const currentFieldTransformValues = [].concat(fieldTransform[fieldOperation]);
      const updatedFieldTransformValues = actionOperation === '$set' ? actionValues : (currentFieldTransformValues || []).concat(actionValues);

      return {
        [actionOperation === '$set' ? actionOperation : fieldOperation] : updatedFieldTransformValues
      }
    }, {})
  }), {});

  return ih(base, transform);
}


// looking at an aggregator field, and data coming from source
// this data could match values on the aggregator based on the associated labels
// 1. find out which labels are associated to the data on the source independently of the aggregatorField

function extractAutomaticValues(sourceAgendaSchema, aggregatorAgendaSchema, aggregatorFieldName, data) {
  const sourceFieldsWithData = Object.keys(data);
  const optionedSourceFieldsWithData = sourceAgendaSchema.fields
    .filter(f => !!f.options && sourceFieldsWithData.includes(f.field));

  const labels = optionedSourceFieldsWithData.reduce((labels, sourceField) => labels.concat(convertFieldOptionIdsToLabels(sourceField, data[sourceField.field])), []);

  if (!labels.length) return [];

  const aggregatorField = aggregatorAgendaSchema.fields.filter(f => f.field === aggregatorFieldName).pop();

  if (!aggregatorField) return [];

  const aggregatorOptionIdsByLabel = aggregatorField.options
    .reduce((aggregatorOptionIdsByLabel, option) => {
      const optionLabels = typeof option.label === 'string' ? [option.label] : Object.values(option.label);
      return optionLabels.reduce((aggregatorOptionIdsByLabel, label) => ({
        ...aggregatorOptionIdsByLabel,
        [label] : option.id
      }), aggregatorOptionIdsByLabel);
    }, {});

  return labels.map(l => aggregatorOptionIdsByLabel[l]).filter(id => !!id);
}


function forceExplicitActionOperation(action, forceOperation = null) {
  const currentOperation = Object.keys(action.values || {}).shift();
  const actionHasOperation = ['$set', '$push'].includes(currentOperation);

  const actionValues = actionHasOperation ? action.values[currentOperation] : action.values;

  if (forceOperation) {
    return {
      ...action,
      values: { [forceOperation] : actionValues }
    };
  } else if (!currentOperation) {
    return {
      ...action,
      values: { '$push' : actionValues }
    };
  }

  return action;
}
