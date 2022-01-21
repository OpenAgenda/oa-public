'use strict';

const getTargetField = require('./getTargetField');

const flatten = (value, lang, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'string') {
    return value;
  }

  if (value[lang] === undefined) {
    return value[Object.keys(value).shift()];
  }

  return value[lang];
};

module.exports = function fieldToFlattenerMapItem(field, options = {}) {
  const {
    lang,
    languages = [],
    includeLanguages
  } = options;

  const targetBaseName = flatten(field.label, lang, field.field);

  // multilingual text field
  if (field.languages) {
    return {
      source: field.field,
      target: includeLanguages ? includeLanguages.map(l => `${targetBaseName} - ${l.toUpperCase()}`)
        : languages.map(l => `${targetBaseName} - ${l.toUpperCase()}`),
      languages
    };
  }

  // optioned field
  if (field.options) {
    return {
      source: field.field,
      target: targetBaseName,
      transform: field.options.reduce((transform, option) => ({
        ...transform,
        [option.id]: flatten(option.label, lang, option.value)
      }), {})
    };
  }

  // location tags subfield
  if (field.legacy) {
    const getTarget = getTargetField.bind(null, options.labels, options.lang);
    return {
      source: 'location.tags',
      target: getTarget('location.tags'),
      transform: tags => (tags ? tags.map(tag => tag.label).join(' | ') : '')
    };
  }

  return {
    source: field.field,
    target: targetBaseName
  };
};
