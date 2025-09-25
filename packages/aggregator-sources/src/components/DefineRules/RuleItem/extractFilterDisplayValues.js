import formLabels from '@openagenda/labels/event/form.js';
import { getLocaleValue } from '@openagenda/intl';
import { hasFilter } from '../../../utils/rules.js';
import messages from './messages.js';

const eventTextFields = [
  'title',
  'description',
  'longDescription',
  'keywords',
  'conditions',
].map((field) => ({
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

const findDisplayedValue = (field, rule, filterFieldName, intl) => {
  if (field.fieldType !== 'boolean') {
    return field.options
      .filter((o) => [].concat(rule.query[filterFieldName]).includes(o.id))
      .map((o) => getLocaleValue(o.label, intl.locale))
      .join(', ');
  }
  return [].concat(
    rule.query[filterFieldName]
      .map((v) => getLocaleValue(formLabels[`${v}Boolean`], intl.locale))
      .join(', '),
  );
};

const pickFieldInFields = (fields, field) =>
  fields.filter((f) => f.field === field).pop();

function getFilterType(rule) {
  if (!hasFilter(rule)) return null;

  const key = Object.keys(rule.query)[0];

  return ['location', 'tags', 'text', 'languages', 'timings'].includes(key)
    ? key
    : 'choice';
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

const choiceFilter = ({ intl, rule, sourceAgendaSchema, sourceAgenda }) => {
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
    value: findDisplayedValue(field, rule, filterFieldName, intl),
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
  let allowOnlineEventValue = rule.query.location?.allowOnlineEvent || false;

  // Fix: Handle case where allowOnlineEvent is stored as an array
  if (Array.isArray(allowOnlineEventValue)) {
    allowOnlineEventValue = allowOnlineEventValue[0] || false;
  }

  return {
    label: intl.formatMessage(messages[locationType]),
    value: []
      .concat(rule.query.location[getFilterLocationType(rule)])
      .join(', '),
    detail: intl.formatMessage(messages.eventLocationDetail, {
      geo: intl.formatMessage(messages[locationType]),
    }),
    caseSensitive: rule.query.location?.caseSensitive,
    allowOnlineEvent: allowOnlineEventValue,
  };
};

const textFilter = ({ intl, rule, sourceAgendaSchema = { fields: [] } }) => {
  const textField = getTextFilterField(rule);
  const allFields = sourceAgendaSchema.fields.concat(eventTextFields);
  const field = pickFieldInFields(allFields, textField);
  const label = getLocaleValue(field.label, intl.locale);

  let value = !rule.query.text.wholeValue
    ? intl.formatMessage(messages.textFilterValue, {
      value: rule.query.text[textField],
    })
    : intl.formatMessage(messages.textFilterWholeValue, {
      value: rule.query.text[textField],
    });
  if (rule.query.text.wholeValue && !rule.query.text[textField]) {
    value = intl.formatMessage(messages.textFilterNotDefined);
  }

  return {
    label,
    value,
    caseSensitive: rule.query.text?.caseSensitive,
  };
};

const languagesFilter = ({ intl, rule }) => {
  const values = rule.query.languages.map((el) => {
    const formated = intl.formatDisplayName(el, { type: 'language' });
    return formated.charAt(0).toUpperCase() + formated.slice(1);
  });
  return {
    label: intl.formatMessage(messages.languagesFilter),
    value: values.join(' ,'),
  };
};

const timingsFilter = ({ intl, rule }) => {
  const value = rule.query.timings;

  return {
    label: intl.formatMessage(messages.timingsFilter),
    value: intl.formatDateTimeRange(new Date(value.gte), new Date(value.lte), {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }),
  };
};

export default ({ intl, sourceAgenda, sourceAgendaSchema, rule }) => {
  const type = getFilterType(rule);
  switch (type) {
    case 'location':
      return locationFilter({ intl, rule });
    case 'text':
      return textFilter({ intl, rule, sourceAgendaSchema });
    case 'tags':
      return tagsFilter({ intl, rule, sourceAgenda });
    case 'languages': {
      return languagesFilter({ intl, rule });
    }
    case 'timings': {
      return timingsFilter({ intl, rule });
    }
    default:
      return choiceFilter({
        intl,
        rule,
        sourceAgendaSchema,
        sourceAgenda,
      });
  }
};
