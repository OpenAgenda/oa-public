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
    languages = [],
    includeLanguages,
    spreadFields = [],
  } = options;

  const targetBaseName = flatten(field.label, lang, field.field);

  // multilingual text field
  if (field.languages) {
    return {
      source: field.field,
      target: includeLanguages ? includeLanguages.map(l => `${targetBaseName} - ${l.toUpperCase()}`)
        : languages.map(l => `${targetBaseName} - ${l.toUpperCase()}`),
      languages,
    };
  }

  // fields to spread over several columns
  if (spreadFields.length && spreadFields.includes(field.field) && field.options) {
    const opts = field.options.map(option => {
      const optionLabel = flatten(option.label, lang, option.value);
      const target = `${targetBaseName}: ${optionLabel}`;
      return {
        source: field.field,
        target,
        transform: {
          [option.id]: optionLabel,
        },
      };
    });
    return opts;
  }

  // optioned field
  if (field.options) {
    return {
      source: field.field,
      target: targetBaseName,
      hasOptions: true,
      transform: field.options.reduce((transform, option) => ({
        ...transform,
        [option.id]: flatten(option.label, lang, option.value),
      }), {}),
    };
  }

  return {
    source: field.field,
    target: targetBaseName,
  };
};
