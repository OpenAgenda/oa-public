import _ from 'lodash';
import moment from 'moment-timezone';
import schema from '@openagenda/validators/schema/index';
import { cleanString } from '@openagenda/utils';
import textValidator from '@openagenda/validators/text';
import passValidator from '@openagenda/validators/pass';

schema.register({
  text: textValidator,
  pass: passValidator,
});

const formatDescription = (description, dateRange, html = '') =>
  `<strong>${dateRange}</strong><p>${description}</p>${cleanString(html)}`;
const pickLanguage = (event, lang) =>
  (event.title[lang] ? lang : Object.keys(event.title)[0]);

const pickOptionLabel = (label, lang, fallback) => {
  if (!label) return fallback;
  if (typeof label === 'string') return label;
  if (label[lang]) return label[lang];
  const first = Object.keys(label)[0];
  return first ? label[first] : fallback;
};

const resolveCategoriesForField = (event, categoryField, formSchema, lang) => {
  if (!categoryField || !formSchema?.fields) return [];
  const field = formSchema.fields.find((f) => f.field === categoryField);
  if (!field || !field.options) return [];

  return []
    .concat(_.get(event, categoryField) ?? [])
    .map((id) => {
      const option = field.options.find((o) => o.id === id);
      if (!option) return null;
      return pickOptionLabel(option.label, lang, option.value);
    })
    .filter((v) => !!v);
};

const resolveCategories = (event, categoryFields, formSchema, lang) =>
  []
    .concat(categoryFields ?? [])
    .flatMap((f) => resolveCategoriesForField(event, f, formSchema, lang));

const validateOptions = schema({
  lang: {
    type: 'text',
    default: 'fr',
  },
  genUrl: {
    type: 'pass',
    default: (data) => `https://openagenda.com/events/${data.uid}`,
  },
  dateField: {
    type: 'text',
    default: 'updatedAt',
  },
  categoryFields: {
    type: 'pass',
    optional: true,
    default: null,
  },
  formSchema: {
    type: 'pass',
    optional: true,
    default: null,
  },
});

export default (event, options = {}) => {
  const cleanOptions = validateOptions(options);
  const lang = pickLanguage(event, cleanOptions.lang);
  const categories = resolveCategories(
    event,
    cleanOptions.categoryFields,
    cleanOptions.formSchema,
    lang,
  );

  return {
    title: _.get(event, `title.${lang}`, ''),
    description: formatDescription(
      _.get(event.description, lang, ''),
      _.get(event.dateRange, lang, event.dateRange.fr),
      _.get(event.longDescription, lang, ''),
    ),
    url: cleanOptions.genUrl(event),
    guid: [_.get(event, 'agenda.uid', null), event.uid]
      .filter((v) => !!v)
      .join('/'),
    date: _.get(event, cleanOptions.dateField, event.updatedAt),
    lat: _.get(event, 'location.latitude', null),
    long: _.get(event, 'location.longitude', null),
    ...categories.length ? { categories } : {},
    custom_elements: [
      {
        'ev:startdate': moment
          .tz(_.first(event.timings).begin, event.timezone)
          .format('YYYY-MM-DDTHH:mm:ss'),
      },
      {
        'ev:enddate': moment
          .tz(_.last(event.timings).end, event.timezone)
          .format('YYYY-MM-DDTHH:mm:ss'),
      },
      {
        'ev:location': [
          _.get(event, 'location.name'),
          _.get(event, 'location.address'),
        ]
          .filter((v) => v)
          .join(' - '),
      },
    ],
    ...event.image
      ? {
        enclosure: {
          url: (event.image.base + event.image.filename).replace(
            'https://',
            'http://',
          ),
          type: 'image/jpeg',
        },
      }
      : {},
  };
};
