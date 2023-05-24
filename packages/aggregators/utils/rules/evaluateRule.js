'use strict';

const log = require('@openagenda/logs')('utils/rules/evaluateRule');
const evaluateLocation = require('./location');
const evaluateLabels = require('./labels');
const evaluateText = require('./text');

module.exports = (rule, sourceAgendaSchema, aggregatorAgendaSchema, data) => {
  if (!data) {
    throw new Error('data is required');
  }
  const required = rule.required === undefined ? true : !!rule.required;

  if (
    rule.query.location
    && !evaluateLocation(data.location, rule.query.location)
  ) {
    log('location filter is set but does not match');
    return required ? false : null;
  }

  if (
    rule.query.tags
    && !evaluateLabels(sourceAgendaSchema, rule.query.tags, data)
  ) {
    log('tags filter is set but does not match');
    return required ? false : null;
  }

  if (rule.query.text && !evaluateText(rule.query.text, data)) {
    log('text filter is set but does not match');
    return required ? false : null;
  }
  const otherRuleFields = Object.keys(rule.query).filter(
    f => !['location', 'tags', 'text'].includes(f),
  );
  log('evaluating remaining %s rule query fields', otherRuleFields?.length);

  for (const ruleField of otherRuleFields) {
    const values = [].concat(data[ruleField]) || [];
    const query = [].concat(rule.query[ruleField]);

    if (!values.filter(v => query.includes(v)).length) {
      log(
        'rule %s does not match and is %srequired',
        ruleField,
        required ? '' : ' not',
      );
      return required ? false : null;
    }
  }
  return rule.actions;
};
