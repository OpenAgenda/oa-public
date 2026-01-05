import getFormSchemaAdditionalFields from './getFormSchemaAdditionalFields.js';
import getAdditionalFieldMappedNameAndType from './getAdditionalFieldMappedNameAndType.js';
import removeDiacritics from './removeDiacritics.js';

const multilingualFieldsMap = {
  keywords: '_search_keywords_text',
  title: '_search_title',
  description: '_search_description',
};

function _addSchemaIdPrefix(field, value) {
  return [].concat(value).map((v) => {
    if (!`${v}`.includes('.')) {
      return [field.schemaId, v].join('.');
    }
    return v;
  });
}

function _getMLTLocationValue(location) {
  return removeDiacritics(
    ['address', 'city', 'department', 'region', 'adminLevel3', 'adminLevel5']
      .filter((f) => !!location[f])
      .map((f) => location[f])
      .join(' '),
  );
}

export default (MLTQuery, options = {}) => {
  const { formSchema } = {
    formSchema: null,
    ...options,
  };

  const MLT = {
    fields: [],
    min_word_length: 3,
    min_term_freq: 1,
    min_doc_freq: 1,
    like: [],
  };

  // handle multilingual fields
  const doc = Object.keys(multilingualFieldsMap).reduce(
    (doc1, multilingualField) => {
      if (MLTQuery[multilingualField] === undefined) {
        return doc1;
      }
      const values = typeof MLTQuery[multilingualField] === 'string'
        ? [MLTQuery[multilingualField]]
        : Object.values(MLTQuery[multilingualField]);
      const mappedField = multilingualFieldsMap[multilingualField];

      return {
        ...doc1,
        [mappedField]: values.join(' '),
      };
    },
    {},
  );

  // location
  if (MLTQuery.location) {
    doc._search_full_address_text = _getMLTLocationValue(MLTQuery.location);
    MLT.fields.push('_search_full_address_text');
  }

  if (Object.keys(doc).length) {
    MLT.fields = Object.keys(doc);
    MLT.like.push({ doc });
  }

  // handle additional fields
  getFormSchemaAdditionalFields(formSchema)
    .filter((f) => MLTQuery[f.field] !== undefined)
    .forEach((additionalField) => {
      const mappedField = getAdditionalFieldMappedNameAndType(additionalField);

      if (mappedField.type === 'keyword') {
        _addSchemaIdPrefix(
          additionalField,
          MLTQuery[additionalField.field],
        ).forEach((value) => {
          MLT.like.push(value);
        });
        if (!MLT.fields.includes(mappedField.name)) {
          MLT.fields.push(mappedField.name);
        }
      }
    });

  return MLT;
};
