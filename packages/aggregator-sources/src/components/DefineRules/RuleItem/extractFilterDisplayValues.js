import formLabels from '@openagenda/labels/event/form';
import { getLocaleValue } from '@openagenda/intl';
import { hasFilter } from '../../../utils/rules';
import messages from './messages';

const eventTextFields = [
  'title',
  'description',
  'longDescription',
  'keywords',
  'conditions',
].map(field => ({
  field,
  label: formLabels[field],
}));

const attendanceModeField = {
  field: 'attendanceMode',
  label: formLabels.attendanceMode,
  options: [
    {
      id: 1,
      value: 'offlineAttendanceMode',
      label: formLabels.offlineAttendanceMode,
    },
    {
      id: 2,
      value: 'onlineAttendanceMode',
      label: formLabels.onlineAttendanceMode,
    },
    {
      id: 3,
      value: 'mixedAttendanceMode',
      label: formLabels.mixedAttendanceMode,
    },
  ],
};

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
  const allFields = sourceAgendaSchema.fields.concat(attendanceModeField);
  const field = pickFieldInFields(allFields, filterFieldName);
  if (!field) {
    return {
      label: intl.formatMessage(messages.brokenFilter),
      value: intl.formatMessage(messages.brokenFilterInfo),
      detail: JSON.stringify(rule),
      broken: true,
    };
  }
  return {
    label: getLocaleValue(field.label, intl.locale),
    value: field.options
      .filter(o => [].concat(rule.query[filterFieldName]).includes(o.id))
      .map(o => getLocaleValue(o.label, intl.locale))
      .join(', '),
    detail: intl.formatMessage(messages.sourceAgendaChoiceFieldValueDetail, {
      agendaTitle: sourceAgenda.title,
    }),
  };
};

const tagsFilter = ({ intl, rule, sourceAgenda }) => ({
  label: intl.formatMessage(messages.tags),
  value: [].concat(rule.query.tags).join(', '),
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
  const allFields = sourceAgendaSchema.fields.concat(eventTextFields);
  const field = pickFieldInFields(allFields, textField);
  const label = getLocaleValue(field.label, intl.locale);
  return {
    label,
    value: intl.formatMessage(messages.textFilterValue, {
      value: rule.query.text[textField],
    }),
    casse: rule.query.text?.caseSensitive,
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
