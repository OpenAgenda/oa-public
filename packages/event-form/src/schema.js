import { produce } from 'immer';
import eventFormLabels from '@openagenda/labels/event/form.js';
import merge from '@openagenda/form-schemas/iso/merge.js';
import schemaLanguages from './utils/schemaLanguages.js';
import injectValidators from './utils/injectValidators.js';
import eventFields from './fields/event.js';

function _fillInTheBlanks(labels, defaultLang = 'en') {
  return produce(labels, (draft) => {
    Object.keys(draft).forEach((field) => {
      Object.keys(draft[field]).forEach((lang) => {
        if (!draft[field][lang].length) {
          draft[field][lang] = draft[field][defaultLang];
        }
      });
    });
    return draft;
  });
}

const labels = _fillInTheBlanks(eventFormLabels);

export default (options = {}) => {
  const {
    includeEventFields,
    interfaceLanguage,
    languages,
    schemaExtensions,
    excludeSystemFields,
    excludeNonDataFields,
    access,
  } = {
    includeEventFields: true,
    access: {
      read: 'public',
      write: 'public',
    },
    ...options,
  };

  const eventSchema = {
    fields: [],
    type: 'event',
  };

  injectValidators(eventSchema);

  eventSchema.fields = eventFields({
    labels,
    excludeSystemFields,
  });

  const hasExtensions = Array.isArray(schemaExtensions);

  // here, for generating the form, provided access as write should suffice
  const finalSchema = merge(
    ...[eventSchema]
      .concat(hasExtensions ? schemaExtensions : [])
      .concat({ access }),
  );

  if (hasExtensions && !includeEventFields) {
    const eventSchemaFields = eventSchema.fields.map((f) => f.field);
    finalSchema.fields = finalSchema.fields.filter(
      (f) => !eventSchemaFields.includes(f.field),
    );
  }

  if (excludeNonDataFields) {
    finalSchema.fields = finalSchema.fields.filter(
      (f) => f.field !== 'languages',
    );
  }

  return schemaLanguages.set(finalSchema, interfaceLanguage, languages);
};

export { eventFields };
