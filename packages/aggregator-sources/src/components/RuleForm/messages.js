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
  languagesFilter: {
    id: 'aggregator-sources.RuleForm.languagesFilter',
    defaultMessage: 'Languages filter',
  },
  timingsFilter: {
    id: 'aggregator-sources.RuleForm.timingsFilter',
    defaultMessage: 'Timings filter',
  },
  RespectCase: {
    id: 'aggregator-sources.RuleForm.RespectCase',
    defaultMessage: 'Respect case',
  },
  textFilterCaseSensitive: {
    id: 'aggregator-sources.RuleForm.textFilterCaseSensitive',
    defaultMessage: 'the filter is case sensitive',
  },
  allowOnlineEvent: {
    id: 'aggregator-sources.RuleForm.allowOnlineEvent',
    defaultMessage: 'Include online events',
  },
  allowOnlineEventHelp: {
    id: 'aggregator-sources.RuleForm.allowOnlineEventHelp',
    defaultMessage: 'Include events that are held online',
  },
  allowOnlineEventAll: {
    id: 'aggregator-sources.RuleForm.allowOnlineEventAll',
    defaultMessage: 'Include all online events',
  },
  allowOnlineEventStrict: {
    id: 'aggregator-sources.RuleForm.allowOnlineEventStrict',
    defaultMessage:
      'Include online events without a location or with a location matching the filter',
  },
  tagFilter: {
    id: 'aggregator-sources.RuleForm.tagFilter',
    defaultMessage: 'Tag filter',
  },
  city: {
    id: 'aggregator-sources.RuleForm.city',
    defaultMessage: 'City',
  },
  adminLevel3: {
    id: 'aggregator-sources.RuleForm.adminLevel3',
    defaultMessage: 'Intercommunality',
  },
  department: {
    id: 'aggregator-sources.RuleForm.department',
    defaultMessage: 'Department',
  },
  region: {
    id: 'aggregator-sources.RuleForm.region',
    defaultMessage: 'Region',
  },
  district: {
    id: 'aggregator-sources.RuleForm.district',
    defaultMessage: 'District',
  },
  postalCode: {
    id: 'aggregator-sources.RuleForm.postalCode',
    defaultMessage: 'Postal code',
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
  helpFilterLanguages: {
    id: 'aggregator-sources.RuleForm.helpFilterLanguages',
    defaultMessage:
      'Apply the rule to events having a specific language defined in the source.',
  },
  helpFilterTimings: {
    id: 'aggregator-sources.RuleForm.helpFilterTimings',
    defaultMessage:
      'Apply the rule to events that have at least one timing matching the limits',
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
      'Actions only apply to the event if it matches the filter criteria.',
  },
  useActions: {
    id: 'aggregator-sources.RuleForm.useActions',
    defaultMessage: 'Simple mode',
  },
  useActionsDesc: {
    id: 'aggregator-sources.RuleForm.useActionsDesc',
    defaultMessage:
      'Perform processing on the event when aggregating it.Ex: categorize it, give it a status, define a value on a field in the aggregator calendar',
  },
  wholeValueFilter: {
    id: 'aggregator-sources.RuleForm.wholeValueFilter',
    defaultMessage: 'The whole value of the field is compared to the filter',
  },
  setTextValue: {
    id: 'aggregator-sources.RuleForm.setTextValue',
    defaultMessage: 'Define a value',
  },
  copyTextValue: {
    id: 'aggregator-sources.RuleForm.copyTextValue',
    defaultMessage: 'Copy a value',
  },
  copyTextPlaceholder: {
    id: 'aggregator-sources.RuleForm.copyTextPlaceholder',
    defaultMessage: 'Select the source field to copy',
  },
  setTextTitle: {
    id: 'aggregator-sources.RuleForm.setTextTitle',
    defaultMessage:
      'Your entry will be applied to the targeted field when aggregating the event on your agenda',
  },
  copyTextTitle: {
    id: 'aggregator-sources.RuleForm.copyTextTitle',
    defaultMessage:
      'The value defined in the targeted source field will be applied to the targeted field when aggregating the event on your agenda',
  },
  textPlaceholder: {
    id: 'aggregator-sources.RuleForm.textPlaceholder',
    defaultMessage: 'Text field',
  },
  textareaPlaceholder: {
    id: 'aggregator-sources.RuleForm.textareaPlaceholder',
    defaultMessage: 'Textarea',
  },
  markdownPlaceholder: {
    id: 'aggregator-sources.RuleForm.markdownPlaceholder',
    defaultMessage: 'Rich text',
  },
  emailPlaceholder: {
    id: 'aggregator-sources.RuleForm.emailPlaceholder',
    defaultMessage: 'Email',
  },
  phonePlaceholder: {
    id: 'aggregator-sources.RuleForm.phonePlaceholder',
    defaultMessage: 'Phone',
  },
  datePlaceholder: {
    id: 'aggregator-sources.RuleForm.datePlaceholder',
    defaultMessage: 'Pick a date',
  },
  linkPlaceholder: {
    id: 'aggregator-sources.RuleForm.linkPlaceholder',
    defaultMessage: 'Hyperlink',
  },
  selectLanguages: {
    id: 'aggregator-sources.RuleForm.selectLanguages',
    defaultMessage: 'Select languages',
  },
  selected: {
    id: 'aggregator-sources.RuleForm.selected',
    defaultMessage: 'Selected',
  },
  notSelected: {
    id: 'aggregator-sources.RuleForm.notSelected',
    defaultMessage: 'Not selected',
  },
});
