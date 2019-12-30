'use strict';

const evaluateLocation = require('../../../lib/rules/location');

module.exports = (rule, data) => {
  if (!data) {
    throw new Error('data is required');
  }
  const required = rule.required === undefined ? true : !!rule.required;

  if (rule.query.location && !evaluateLocation(data.location, rule.query.location)) {
    return required ? false : null;
  }

  const otherRuleFields = Object.keys(rule.query)
    .filter(f => !['location'].includes(f));

  for (const ruleField of otherRuleFields) {
    const values = [].concat(data[ruleField]) || [];
    const query = [].concat(rule.query[ruleField]);

    if (!values.filter(v => query.includes(v)).length) {
      return required ? false : null;
    }
  }

  return rule.actions;
}
