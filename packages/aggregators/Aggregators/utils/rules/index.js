'use strict';

const ih = require( 'immutability-helper' );
const evaluateRule = require('./evaluateRule');
const cleanRule = require('./clean')

module.exports = (rules, data) => {
  const actions = [];

  for (const rule of [].concat(rules)) {
    const ruleActions = evaluateRule(cleanRule(rule), data);

    if (ruleActions === false) {
      return null;
    } else if (ruleActions) {
      ruleActions.forEach(a => actions.push(a));
    }
  }

  const actionsByField = actions.reduce((actionsByField, action) => {
    const actionField = Object.keys(action)[0];
    return {
      ...actionsByField,
      [actionField]: (actionsByField[actionField] || []).concat(action[actionField])
    }
  }, {});

  // first action of any given field is necessarily a $set.
  Object.keys(actionsByField).forEach(actionField => {
    actionsByField[actionField][0] = {
      $set: _extractActionValue(actionsByField[actionField][0])
    }
  });

  // reduce to one transform per field
  return ih(data, Object.keys(actionsByField).reduce((transform, field) => ({
    ...transform,
    [field]: actionsByField[field].reduce((fieldAction, action) => {
      if (_extractActionOperation(action) === '$set') {
        return { $set: _extractActionValue(action) };
      } else {
        return {
          [_extractActionOperation(fieldAction)]: [].concat(_extractActionValue(fieldAction)).concat(_extractActionValue(action))
        };
      }
    }, {})
  }), {}))
}

function _extractActionOperation(action) {
  if (!action instanceof Object) return '$set';

  return Object.keys(action)[0];
}

function _extractActionValue(action) {
  if (!(action instanceof Object)) {
    return action;
  }

  return action[Object.keys(action)[0]];
}
