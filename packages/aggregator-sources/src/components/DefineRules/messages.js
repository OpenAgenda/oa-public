import { defineMessages } from 'react-intl';

export default defineMessages({
  requiredType: {
    id: 'aggregator-sources.DefineRules.requiredType',
    defaultMessage: 'Required type',
  },
  noFilter: {
    id: 'aggregator-sources.DefineRules.noFilter',
    defaultMessage: 'No filter',
  },
  filters: {
    id: 'aggregator-sources.DefineRules.filters',
    defaultMessage: 'Filters',
  },
  actions: {
    id: 'aggregator-sources.DefineRules.actions',
    defaultMessage: 'Actions',
  },
  filtersDesc: {
    id: 'aggregator-sources.DefineRules.filtersDesc',
    defaultMessage:
      'Filters allow you to choose which events should be aggregated',
  },
  actionsDesc: {
    id: 'aggregator-sources.DefineRules.actionsDesc',
    defaultMessage:
      'Actions allow you to carry out processing on events at the time of their aggregation. Ex: categorize them, give them a status, define a value on a particular field...',
  },
  requiredSubdivision: {
    id: 'aggregator-sources.DefineRules.requiredSubdivision',
    defaultMessage: 'Required subdivision',
  },
  requiredValues: {
    id: 'aggregator-sources.DefineRules.requiredValues',
    defaultMessage: 'Required values',
  },
  uselessRule: {
    id: 'aggregator-sources.DefineRules.uselessRule',
    defaultMessage: 'Please define at least a required filter or one action',
  },
  uselessRuleWithFilter: {
    id: 'aggregator-sources.DefineRules.uselessRuleWithFilter',
    defaultMessage:
      'An aggregation rule with filter not required must have at least one action',
  },
  cancel: {
    id: 'aggregator-sources.DefineRules.cancel',
    defaultMessage: 'Cancel',
  },
  update: {
    id: 'aggregator-sources.DefineRules.update',
    defaultMessage: 'Update',
  },
  add: {
    id: 'aggregator-sources.DefineRules.add',
    defaultMessage: 'Add',
  },
  addARule: {
    id: 'aggregator-sources.DefineRules.addARule',
    defaultMessage: 'Add a rule',
  },
  addAFilter: {
    id: 'aggregator-sources.DefineRules.addAFilter',
    defaultMessage: 'Add a filter',
  },
  addAnAction: {
    id: 'aggregator-sources.DefineRules.addAnAction',
    defaultMessage: 'Add an action',
  },
  newRule: {
    id: 'aggregator-sources.DefineRules.newRule',
    defaultMessage: 'New rule',
  },
  newFilter: {
    id: 'aggregator-sources.DefineRules.newFilter',
    defaultMessage: 'New filter',
  },
  newAction: {
    id: 'aggregator-sources.DefineRules.newAction',
    defaultMessage: 'New action',
  },
  updateARule: {
    id: 'aggregator-sources.DefineRules.updateARule',
    defaultMessage: 'Update a rule',
  },
  updateAFilter: {
    id: 'aggregator-sources.DefineRules.updateAFilter',
    defaultMessage: 'Update a filter',
  },
  updateAnAction: {
    id: 'aggregator-sources.DefineRules.updateAnAction',
    defaultMessage: 'Update an action',
  },
  noDefinedRule: {
    id: 'aggregator-sources.DefineRules.noDefinedRules',
    defaultMessage: 'No defined rule',
  },
  pasteRules: {
    id: 'aggregator-sources.DefineRules.pasteRules',
    defaultMessage: 'Apply rules from another source',
  },
  manualPasteRules: {
    id: 'aggregator-sources.DefineRules.manualPasteRules',
    defaultMessage: 'Paste rules from another source (CTRL + V)',
  },
  description: {
    id: 'aggregator-sources.DefineRules.description',
    defaultMessage:
      'Règles are applied to the events in their aggregation.{br} They are used to condition the aggregation, or to assign values to extended fields in your agenda.',
  },
  missingRequiredFields: {
    id: 'aggregator-sources.DefineRules.missingRequiredFields',
    defaultMessage:
      '{fieldsCount, plural, =1 {The field {fields} is required} other {The fields {fields} are required}}.',
  },
  ruleDescription: {
    id: 'aggregator-sources.DefineRules.ruleDescription',
    defaultMessage:
      'A rule consists of a filter and/or actions applied to each event published on the source.',
  },
  startAfterEnd: {
    id: 'aggregator-sources.DefineRules.startAfterEnd',
    defaultMessage: 'The beginning must be before the end.',
  },
});
