import { hasFilter } from '../../../utils/rules';
import getMultiLanguageLabel from '../../../utils/getMultiLanguageLabel';
import messages from './messages';

const pickSchemaField = (schema, field) => schema.fields.filter(f => f.field === field).pop();

function getFilterType(rule) {
  if (!hasFilter(rule)) return null;

  const key = Object.keys(rule.query)[0];

  return ['location', 'tags'].includes(key) ? key : 'choice';
}

function getFilterLocationType(rule) {
  return Object.keys(rule.query.location)[0];
}

function getFilterField(rule) {
  return Object.keys(rule.query)[0];
}

const choiceFilter = ({
  intl, rule, sourceAgendaSchema, sourceAgenda
}) => {
  const filterFieldName = getFilterField(rule);
  const field = pickSchemaField(sourceAgendaSchema, filterFieldName);
  return {
    label: getMultiLanguageLabel(field.label),
    value: field.options
      .filter(o => [].concat(rule.query[filterFieldName]).includes(o.id))
      .map(o => getMultiLanguageLabel(o.label))
      .join(', '),
    detail: intl.formatMessage(messages.sourceAgendaChoiceFieldValueDetail, {
      agendaTitle: sourceAgenda.title
    })
  };
};

const tagsFilter = ({ intl, rule, sourceAgenda }) => ({
  label: intl.formatMessage(messages.tags),
  value: rule.query.tags.join(', '),
  detail: intl.formatMessage(messages.sourceAgendaTagsDetail, {
    agendaTitle: sourceAgenda.title
  })
});

const locationFilter = ({ intl, rule }) => {
  const locationType = getFilterLocationType(rule);
  return {
    label: intl.formatMessage(messages[locationType]),
    value: []
      .concat(rule.query.location[getFilterLocationType(rule)])
      .join(', '),
    detail: intl.formatMessage(messages.eventLocationDetail, {
      geo: intl.formatMessage(messages[locationType])
    })
  };
};

export default ({
  intl, sourceAgenda, sourceAgendaSchema, rule
}) => {
  const type = getFilterType(rule);

  switch (type) {
    case 'location':
      return locationFilter({ intl, rule });
    case 'tags':
      return tagsFilter({ intl, rule, sourceAgenda });
    default:
      return choiceFilter({
        intl,
        rule,
        sourceAgendaSchema,
        sourceAgenda
      });
  }
};
