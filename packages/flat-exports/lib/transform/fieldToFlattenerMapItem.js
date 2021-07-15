'use strict';

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
    languages = []
  } = options;

  const targetBaseName = flatten(field.label, lang, field.field);

  // multilingual text field
  if (field.languages) {
    return {
      source: field.field,
      target: languages.map(l => `${targetBaseName} - ${l.toUpperCase()}`),
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

  return {
    source: field.field,
    target: targetBaseName
  };
};
