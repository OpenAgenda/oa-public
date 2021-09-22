'use strict';

const _ = require('lodash');

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');
const getAdditionalFieldMappedNameAndType = require('./getAdditionalFieldMappedNameAndType');

const multilingualFieldsMap = {
  keywords: '_search_keywords_text',
  title: '_search_title',
  description: '_search_description'
};

module.exports = (MLTQuery, options = {}) => {
  const {
    formSchema
  } = {
    formSchema: null,
    ...options
  };

  const MLT = {
    fields: [],
    min_word_length: 3,
    min_term_freq: 1,
    min_doc_freq: 1,
    like: []
  }

  // handle multilingual fields
  const doc = Object.keys(multilingualFieldsMap).reduce((doc, multilingualField) => {
    if (MLTQuery[multilingualField] === undefined) {
      return doc;
    }
    const values = typeof MLTQuery[multilingualField] === 'string'
      ? [MLTQuery[multilingualField]]
      : Object.values(MLTQuery[multilingualField]);
    const mappedField = multilingualFieldsMap[multilingualField];

    return {
      ...doc,
      [mappedField]: values.join(' ')
    }
  }, {});

  // location
  if (MLTQuery.location) {
    doc['_search_full_address_text'] = _getMLTLocationValue(MLTQuery.location);
    MLT.fields.push('_search_full_address_text');
  }

  if (Object.keys(doc).length) {
    MLT.fields = Object.keys(doc);
    MLT.like.push({ doc });
  }

  // handle additional fields
  getFormSchemaAdditionalFields(formSchema)
    .filter(f => MLTQuery[f.field] !== undefined)
    .forEach(additionalField => {
      const mappedField = getAdditionalFieldMappedNameAndType(additionalField);

      if (mappedField.type === 'keyword') {
        _addSchemaIdPrefix(additionalField, MLTQuery[additionalField.field]).forEach(value => {
          MLT.like.push(value);
        });
        if (!MLT.fields.includes(mappedField.name)) {
          MLT.fields.push(mappedField.name);
        }
      }
    });

  return MLT;
}

function _addSchemaIdPrefix(field, value) {
  return [].concat(value).map(v => {
    if ((v + '').indexOf('.') === -1) {
      return [field.schemaId, v].join('.');
    } else {
      return v;
    }
  });
}

function _getMLTLocationValue(location) {
  return [
    'address', 'city', 'department', 'region', 'adminLevel3', 'adminLevel5'
  ].filter(f => !!location[f]).map(f => location[f]).join(' ')
}
