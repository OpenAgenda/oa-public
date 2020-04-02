import { defineMessages } from 'react-intl';

export default defineMessages({
  requiredType: {
    id: 'aggregator-sources.DefineRules.requiredType',
    defaultMessage: 'Required type'
  },
  noFilter: {
    id: 'aggregator-sources.DefineRules.noFilter',
    defaultMessage: 'No filter'
  },
  requiredSubdivision: {
    id: 'aggregator-sources.DefineRules.requiredSubdivision',
    defaultMessage: 'Required subdivision'
  },
  requiredValues: {
    id: 'aggregator-sources.DefineRules.requiredValues',
    defaultMessage: 'Required values'
  },
  uselessRule: {
    id: 'aggregator-sources.DefineRules.uselessRule',
    defaultMessage: 'Please define at least a required filter or one action'
  },
  uselessRuleWithFilter: {
    id: 'aggregator-sources.DefineRules.uselessRuleWithFilter',
    defaultMessage:
      'An aggregation rule with filter not required must have at least one action'
  },
  cancel: {
    id: 'aggregator-sources.DefineRules.cancel',
    defaultMessage: 'Cancel'
  },
  update: {
    id: 'aggregator-sources.DefineRules.update',
    defaultMessage: 'Update'
  },
  add: {
    id: 'aggregator-sources.DefineRules.add',
    defaultMessage: 'Add'
  },
  addARule: {
    id: 'aggregator-sources.DefineRules.addARule',
    defaultMessage: 'Add a rule'
  },
  newRule: {
    id: 'aggregator-sources.DefineRules.newRule',
    defaultMessage: 'New rule'
  },
  updateARule: {
    id: 'aggregator-sources.DefineRules.updateARule',
    defaultMessage: 'Update a rule'
  },
  noDefinedRule: {
    id: 'aggregator-sources.DefineRules.noDefinedRules',
    defaultMessage: 'No defined rule'
  },
  pasteRules: {
    id: 'aggregator-sources.DefineRules.pasteRules',
    defaultMessage: 'Apply rules from another source'
  },
  manualPasteRules: {
    id: 'aggregator-sources.DefineRules.manualPasteRules',
    defaultMessage: 'Paste rules from another source (CTRL + V)'
  },
  description: {
    id: 'aggregator-sources.DefineRules.description',
    defaultMessage:
      'Règles are applied to the events in their aggregation.{br} They are used to condition the aggregation, or to assign values to extended fields in your agenda.'
  },
  requiredFieldsWarning: {
    id: 'aggregator-sources.DefineRules.requiredFieldsWarning',
    defaultMessage:
      '{fieldsCount, plural, =1 {The field {fields} is required} other {The fields {fields} are required}}.'
  },
  missingRequiredFields: {
    id: 'aggregator-sources.DefineRules.missingRequiredFields',
    defaultMessage:
      '{fieldsCount, plural, =1 {The field {fields} is required} other {The fields {fields} are required}}.'
  },
  ruleDescription: {
    id: 'aggregator-sources.DefineRules.ruleDescription',
    defaultMessage:
      'A rule consists of a filter and/or actions applied to each event published on the source.'
  }
});
