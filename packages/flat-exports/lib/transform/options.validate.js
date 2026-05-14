import schema from '@openagenda/validators/schema/index';
import textValidator from '@openagenda/validators/text';
import passValidator from '@openagenda/validators/pass';
import numberValidator from '@openagenda/validators/number';

schema.register({
  text: textValidator,
  pass: passValidator,
  num: numberValidator,
});

const validate = schema({
  languages: {
    type: 'text',
    max: 2,
    min: 2,
    list: true,
  },
  lang: {
    type: 'text',
    min: 2,
    max: 2,
    default: 'en',
  },
  labels: {
    type: 'pass',
  },
  separator: {
    type: 'text',
    default: ' | ',
    trim: false,
  },
  includeFields: {
    type: 'text',
    list: true,
  },
  includeLanguages: {
    type: 'text',
    list: { default: null },
  },
  formSchema: {
    type: 'pass',
  },
  maintainedFields: {
    type: 'text',
    list: { default: [] },
  },
  agendaUid: {
    type: 'num',
  },
  spreadFields: {
    type: 'text',
    list: true,
  },
});

export default (options) => {
  const clean = validate(options);

  if (Array.isArray(clean.includeLanguages)) {
    clean.includeLanguages = clean.includeLanguages.filter((l) => !!l);
  }

  return clean;
};
