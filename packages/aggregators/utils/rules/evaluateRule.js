'use strict';

const evaluateLocation = require('./location');
const evaluateLabels = require('./labels');

module.exports = (rule, sourceAgendaSchema, aggregatorAgendaSchema, data) => {
  if (!data) {
    throw new Error('data is required');
  }
  const required = rule.required === undefined ? true : !!rule.required;

  if (rule.query.location && !evaluateLocation(data.location, rule.query.location)) {
    return required ? false : null;
  }

  if (rule.query.tags && !evaluateLabels(sourceAgendaSchema, rule.query.tags, data)) {
    return required ? false : null;
  }

  const otherRuleFields = Object.keys(rule.query)
    .filter(f => !['location', 'tags'].includes(f));

  for (const ruleField of otherRuleFields) {
    const values = [].concat(data[ruleField]) || [];
    const query = [].concat(rule.query[ruleField]);

    if (!values.filter(v => query.includes(v)).length) {
      return required ? false : null;
    }
  }

  return rule.actions;
}
