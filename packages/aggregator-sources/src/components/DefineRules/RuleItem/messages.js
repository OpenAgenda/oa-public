import { defineMessages } from 'react-intl';

export default defineMessages({
  allEvents: {
    id: 'aggregator-sources.DefineRules.allEvents',
    defaultMessage: 'All events',
  },
  locationFilter: {
    id: 'aggregator-sources.DefineRules.locationFilter',
    defaultMessage: 'Location filter',
  },
  tags: {
    id: 'aggregator-sources.DefineRules.tags',
    defaultMessage: 'Labels',
  },
  choiceFilter: {
    id: 'aggregator-sources.DefineRules.choiceFilter',
    defaultMessage: 'Choice field filter',
  },
  textFilterValue: {
    id: 'aggregator-sources.DefineRules.textFilterValue',
    defaultMessage: 'contains "{value}"',
  },
  withActions: {
    id: 'aggregator-sources.DefineRules.withActions',
    defaultMessage:
      '{actionCount, plural, =1 {with 1 action} other {with # actions}}',
  },
  update: {
    id: 'aggregator-sources.DefineRules.RuleItem.update',
    defaultMessage: 'Update',
  },
  remove: {
    id: 'aggregator-sources.DefineRules.remove',
    defaultMessage: 'Remove',
  },
  city: {
    id: 'aggregator-sources.DefineRules.city',
    defaultMessage: 'City',
  },
  department: {
    id: 'aggregator-sources.DefineRules.department',
    defaultMessage: 'Department',
  },
  region: {
    id: 'aggregator-sources.DefineRules.region',
    defaultMessage: 'Region',
  },
  name: {
    id: 'aggregator-sources.DefineRules.name',
    defaultMessage: 'Location name',
  },
  published: {
    id: 'aggregator-sources.DefineRules.published',
    defaultMessage: 'Published',
  },
  readyToPublish: {
    id: 'aggregator-sources.DefineRules.readyToPublish',
    defaultMessage: 'Ready to publish',
  },
  toModerate: {
    id: 'aggregator-sources.DefineRules.toModerate',
    defaultMessage: 'To be moderated',
  },
  refused: {
    id: 'aggregator-sources.DefineRules.refused',
    defaultMessage: 'Refused',
  },
  state: {
    id: 'aggregator-sources.DefineRules.state',
    defaultMessage: 'Status',
  },
  other: {
    id: 'aggregator-sources.DefineRules.otherFilter',
    defaultMessage: 'Other',
  },
  automatic: {
    id: 'aggregator-sources.DefineRules.automatic',
    defaultMessage: 'Auto',
  },
  choice: {
    id: 'aggregator-sources.DefineRules.choice',
    defaultMessage: 'Source agenda field',
  },
  editForDetail: {
    id: 'aggregator-sources.DefineRules.editForDetail',
    defaultMessage: 'Edit to see details',
  },
  filterDetail: {
    id: 'aggregator-sources.DefineRules.filterDetail',
    defaultMessage:
      'If the filter matches the event, the associated actions apply',
  },
  requiredFilterDetail: {
    id: 'aggregator-sources.DefineRules.requiredFilter',
    defaultMessage:
      'This rule blocks the aggregation if the filter does not match',
  },
  actionsAfterFilterDetail: {
    id: 'aggregator-sources.DefineRules.actionsAfterFilterDetails',
    defaultMessage:
      'The following values are assigned to the event when the filter matches',
  },
  actionsDetail: {
    id: 'aggregator-sources.DefineRules.actionsDetails',
    defaultMessage:
      'The following actions are always assigned to the aggregated event',
  },
  replacingActionDetail: {
    id: 'aggregator-sources.DefineRules.replacingActionDetail',
    defaultMessage:
      'This value will come replace any other that was defined in a previous rule',
  },
  automaticDetail: {
    id: 'aggregator-sources.DefineRules.automaticDetail',
    defaultMessage:
      'Value assocation is made based on labels of the field of the same name in the source agenda',
  },
  sourceAgendaChoiceFieldValueDetail: {
    id: 'aggregator-sources.DefineRules.sourceAgendaFieldValueDetail',
    defaultMessage: 'Field & Value of the source "{agendaTitle}"',
  },
  sourceAgendaTagsDetail: {
    id: 'aggregator-sources.DefineRules.sourceAgendaTagsDetail',
    defaultMessage:
      'Label of an additional field of the source "{agendaTitle}"',
  },
  eventLocationDetail: {
    id: 'aggregator-sources.DefineRules.eventLocationDetail',
    defaultMessage: '{geo} where the event should take place',
  },
  aggregatorAgendaChoiceFieldValueDetail: {
    id: 'aggregator-sources.DefineRules.aggregatorAgendaChoiceFieldValueDetail',
    defaultMessage:
      'Field & Value of "{agendaTitle}" that will be associated with event',
  },
  actionStateDetail: {
    id: 'aggregator-sources.DefineRules.actionStatusDetail',
    defaultMessage: '{state} is applied to event',
  },
  caseSensitive: {
    id: 'aggregator-sources.DefineRules.caseSensitive',
    defaultMessage: 'case-sensitive',
  },
  caseInsensitive: {
    id: 'aggregator-sources.DefineRules.caseInsensitive',
    defaultMessage: 'case-insensitive',
  },
  brokenFilter: {
    id: 'aggregator-sources.DefineRules.brokenFilter',
    defaultMessage: 'Invalid filter',
  },
  brokenFilterInfo: {
    id: 'aggregator-sources.DefineRules.brokenFilterInfo',
    defaultMessage:
      'this filter refers to a field that cannot be found. It may have been deleted from the source agenda',
  },
});
