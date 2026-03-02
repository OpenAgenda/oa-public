import schema from '@openagenda/validators/schema/index.js';
import boolean from '@openagenda/validators/boolean.js';
import integer from '@openagenda/validators/integer.js';
import choice from '@openagenda/validators/choice.js';
import text from '@openagenda/validators/text.js';
import pass from '@openagenda/validators/pass.js';

import fields from './fields.js';

schema.register({
  boolean,
  integer,
  choice,
  text,
  pass,
});

const base = {
  includeFields: {
    type: 'choice',
    options: fields.map((f) => f.field),
  },
  private: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  access: {
    type: 'text',
    default: 'public',
  },
  draft: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  deleted: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  detailed: {
    type: 'boolean',
    default: false,
  },
  html: {
    type: 'boolean',
    default: false,
  },
  lang: {
    type: 'text',
    optional: true,
    max: 2,
    min: 2,
  },
  useFallbackLang: {
    type: 'boolean',
    default: false,
  },
  useDefaultImage: {
    type: 'boolean',
    default: false,
  },
  imageAsLink: {
    type: 'boolean',
    default: false,
  },
  useDateHoursMinutesFormat: {
    type: 'boolean',
    default: false,
  },
  useLocationObjectFormat: {
    type: 'boolean',
    default: false,
  },
  formSchema: {
    type: 'pass',
    optional: true,
  },
};

export default (extendWith = {}) =>
  schema({
    ...base,
    ...extendWith,
  });
