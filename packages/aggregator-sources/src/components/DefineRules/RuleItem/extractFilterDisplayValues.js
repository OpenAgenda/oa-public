import formLabels from '@openagenda/labels/event/form';
import { hasFilter } from '../../../utils/rules';
import getLocalValue from '../../../utils/getLocalValue';
import messages from './messages';

const eventFields = ['title', 'description', 'keywords', 'conditions'].map(
  field => ({
    field,
    label: formLabels[field],
  })
);

const pickSchemaField = (schema, field) => schema.fields.filter(f => f.field === field).pop();
const pickFieldInFields = (fields, field) => fields.filter(f => f.field === field).pop();

function getFilterType(rule) {
  if (!hasFilter(rule)) return null;

  const key = Object.keys(rule.query)[0];

  return ['location', 'tags', 'text'].includes(key) ? key : 'choice';
}

function getFilterLocationType(rule) {
  return Object.keys(rule.query.location)[0];
}

function getFilterField(rule) {
  return Object.keys(rule.query)[0];
}

function getTextFilterField(rule) {
  return Object.keys(rule.query.text)[0];
}

const choiceFilter = ({
  intl, rule, sourceAgendaSchema, sourceAgenda
}) => {
  const filterFieldName = getFilterField(rule);
  const field = pickSchemaField(sourceAgendaSchema, filterFieldName);
  return {
    label: getLocalValue(field.label),
    value: field.options
      .filter(o => [].concat(rule.query[filterFieldName]).includes(o.id))
      .map(o => getLocalValue(o.label))
      .join(', '),
    detail: intl.formatMessage(messages.sourceAgendaChoiceFieldValueDetail, {
      agendaTitle: sourceAgenda.title,
    }),
  };
};

const tagsFilter = ({ intl, rule, sourceAgenda }) => ({
  label: intl.formatMessage(messages.tags),
  value: rule.query.tags.join(', '),
  detail: intl.formatMessage(messages.sourceAgendaTagsDetail, {
    agendaTitle: sourceAgenda.title,
  }),
});

const locationFilter = ({ intl, rule }) => {
  const locationType = getFilterLocationType(rule);
  return {
    label: intl.formatMessage(messages[locationType]),
    value: []
      .concat(rule.query.location[getFilterLocationType(rule)])
      .join(', '),
    detail: intl.formatMessage(messages.eventLocationDetail, {
      geo: intl.formatMessage(messages[locationType]),
    }),
  };
};

const textFilter = ({ intl, rule, sourceAgendaSchema }) => {
  const textField = getTextFilterField(rule);
  const allFields = sourceAgendaSchema.fields.concat(eventFields);
  const field = pickFieldInFields(allFields, textField);
  const label = getLocalValue(field.label);
  return {
    label,
    value: intl.formatMessage(messages.textFilterValue, {
      value: rule.query.text[textField],
    }),
  };
};

export default ({
  intl, sourceAgenda, sourceAgendaSchema, rule
}) => {
  const type = getFilterType(rule);

  switch (type) {
    case 'location':
      return locationFilter({ intl, rule });
    case 'text':
      return textFilter({ intl, rule, sourceAgendaSchema });
    case 'tags':
      return tagsFilter({ intl, rule, sourceAgenda });
    default:
      return choiceFilter({
        intl,
        rule,
        sourceAgendaSchema,
        sourceAgenda,
      });
  }
};
