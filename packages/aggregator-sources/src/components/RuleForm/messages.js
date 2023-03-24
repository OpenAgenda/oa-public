import { defineMessages } from 'react-intl';

export default defineMessages({
  addAValue: {
    id: 'aggregator-sources.RuleForm.addAValue',
    defaultMessage: 'Add a value',
  },
  locationFilter: {
    id: 'aggregator-sources.RuleForm.locationFilter',
    defaultMessage: 'Location filter',
  },
  choiceFilter: {
    id: 'aggregator-sources.RuleForm.choiceFilter',
    defaultMessage: 'Choice field filter',
  },
  textFilter: {
    id: 'aggregator-sources.RuleForm.textFilter',
    defaultMessage: 'Text field filter',
  },
  RespectCase: {
    id: 'aggregator-sources.RuleForm.RespectCase',
    defaultMessage: 'Respect case',
  },
  textFilterCaseSensitive: {
    id: 'aggregator-sources.RuleForm.textFilterCaseSensitive',
    defaultMessage: 'the filter is case sensitive',
  },
  tagFilter: {
    id: 'aggregator-sources.RuleForm.tagFilter',
    defaultMessage: 'Tag filter',
  },
  city: {
    id: 'aggregator-sources.RuleForm.city',
    defaultMessage: 'City',
  },
  department: {
    id: 'aggregator-sources.RuleForm.department',
    defaultMessage: 'Department',
  },
  region: {
    id: 'aggregator-sources.RuleForm.region',
    defaultMessage: 'Region',
  },
  name: {
    id: 'aggregator-sources.RuleForm.name',
    defaultMessage: 'Name',
  },
  value: {
    id: 'aggregator-sources.RuleForm.value',
    defaultMessage: 'Value:',
  },
  values: {
    id: 'aggregator-sources.RuleForm.values',
    defaultMessage: 'Values:',
  },
  required: {
    id: 'aggregator-sources.RuleForm.required',
    defaultMessage: 'Required:',
  },
  subdivision: {
    id: 'aggregator-sources.RuleForm.subdivision',
    defaultMessage: 'Geographical subdivision:',
  },
  substring: {
    id: 'aggregator-sources.RuleForm.substring',
    defaultMessage: 'substring',
  },
  field: {
    id: 'aggregator-sources.RuleForm.field',
    defaultMessage: 'Field:',
  },
  selectField: {
    id: 'aggregator-sources.RuleForm.selectField',
    defaultMessage: 'Select a field',
  },
  noOption: {
    id: 'aggregator-sources.RuleForm.noOption',
    defaultMessage: 'No option',
  },
  createOption: {
    id: 'aggregator-sources.RuleForm.createOption',
    defaultMessage: 'Add value {value}',
  },
  selectValue: {
    id: 'aggregator-sources.RuleForm.selectValue',
    defaultMessage: 'Select a value',
  },
  selectValueAutomaticMode: {
    id: 'aggregator-sources.RuleForm.selectValueAutomaticMode',
    defaultMessage: 'Values are assigned automatically',
  },
  requiredFilter: {
    id: 'aggregator-sources.RuleForm.requiredFilter',
    defaultMessage:
      'Aggregation only occurs if the event matches the criteria for this rule.',
  },
  addAnAction: {
    id: 'aggregator-sources.RuleForm.addAnAction',
    defaultMessage: 'Add an action',
  },
  removeAction: {
    id: 'aggregator-sources.RuleForm.removeAction',
    defaultMessage: 'Remove action',
  },
  helpFilterLocation: {
    id: 'aggregator-sources.RuleForm.helpFilterLocation',
    defaultMessage:
      'Apply the rule to events corresponding to one or more cities, departments or regions.',
  },
  helpFilterChoice: {
    id: 'aggregator-sources.RuleForm.helpFilterChoice',
    defaultMessage:
      'Apply the rule to events corresponding to one or more values coming from choice fields of the source.',
  },
  helpFilterText: {
    id: 'aggregator-sources.RuleForm.helpFilterText',
    defaultMessage:
      'Apply the rule to events corresponding to one value coming from text fields of the source.',
  },
  helpFilterTag: {
    id: 'aggregator-sources.RuleForm.helpFilterTag',
    defaultMessage:
      'Apply the rule to events associated with optional values whose labels correspond.',
  },
  automaticAssignment: {
    id: 'aggregator-sources.RuleForm.automaticAssignment',
    defaultMessage: 'Automatic assignment',
  },
  automaticDescription: {
    id: 'aggregator-sources.RuleForm.automaticDescription',
    defaultMessage:
      'The values of the field will be defined automatically according to the values read from the source.',
  },
  clearAssignment: {
    id: 'aggregator-sources.RuleForm.clearAssignment',
    defaultMessage: 'Replace values set by previous rules',
  },
  clearDescription: {
    id: 'aggregator-sources.RuleForm.clearDescription',
    defaultMessage:
      'Any value assigned to this field to a rule executed before the current rule is replaced by the value set here',
  },
  modeSimple: {
    id: 'aggregator-sources.RuleForm.modeSimple',
    defaultMessage: 'Simple mode',
  },
  modeAdvanced: {
    id: 'aggregator-sources.RuleForm.modeAdvanced',
    defaultMessage: 'Advanced mode',
  },
  useFilter: {
    id: 'aggregator-sources.RuleForm.useFilter',
    defaultMessage: 'Automatic assignment',
  },
  useFilterDesc: {
    id: 'aggregator-sources.RuleForm.useFilterDesc',
    defaultMessage:
      'The values of the field will be defined automatically according to the values read from the source.',
  },
  useActions: {
    id: 'aggregator-sources.RuleForm.useActions',
    defaultMessage: 'Simple mode',
  },
  useActionsDesc: {
    id: 'aggregator-sources.RuleForm.useActionsDesc',
    defaultMessage: 'Advanced mode',
  },
  wholeValueFilter: {
    id: 'aggregator-sources.RuleForm.wholeValueFilter',
    defaultMessage: 'The whole value of the field is compared to the filter',
  },
});
