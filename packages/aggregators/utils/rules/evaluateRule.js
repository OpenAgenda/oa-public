'use strict';

const log = require('@openagenda/logs')('utils/rules/evaluateRule');
const evaluateLocation = require('./location');
const evaluateLabels = require('./labels');
const evaluateText = require('./text');
const evaluateLanguages = require('./languages');
const evaluateTimings = require('./timings');

module.exports = (rule, sourceAgendaSchema, aggregatorAgendaSchema, data) => {
  if (!data) {
    throw new Error('data is required');
  }

  const { required, query, actions } = rule;

  const isRequired = !!(required ?? true);

  if (query.location && !evaluateLocation(data.location, query.location)) {
    log('location filter is set but does not match');
    return isRequired ? false : null;
  }

  if (query.tags && !evaluateLabels(sourceAgendaSchema, query.tags, data)) {
    log('tags filter is set but does not match');
    return isRequired ? false : null;
  }

  if (query.text && !evaluateText(query.text, data)) {
    log('text filter is set but does not match');
    return isRequired ? false : null;
  }

  if (query.languages && !evaluateLanguages(query.languages, data)) {
    log('language filter is set but does nor match');
    return required ? false : null;
  }

  if (query.timings && !evaluateTimings(query.timings, data)) {
    log('timings filter is set but does not match');
    return required ? false : null;
  }

  const otherRuleFields = Object.keys(query).filter(
    f => !['location', 'tags', 'text', 'languages', 'timings'].includes(f),
  );
  log('evaluating remaining %s rule query fields', otherRuleFields?.length);

  for (const ruleField of otherRuleFields) {
    const values = [].concat(data[ruleField]) || [];
    const ruleQuery = [].concat(query[ruleField]);
    if (
      !values.filter(v => {
        if (v === undefined) return ruleQuery.includes(null);
        return ruleQuery.includes(v);
      }).length
    ) {
      log(
        'rule %s does not match and is %srequired',
        ruleField,
        isRequired ? '' : ' not',
      );
      return isRequired ? false : null;
    }
  }
  return actions;
};
