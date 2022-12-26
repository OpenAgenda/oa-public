'use strict';

const slug = require('slugify');

const flatten = (label, preferredLang = 'fr') => {
  if (typeof label === 'string') {
    return label;
  }

  return (label ?? {})[preferredLang] ?? label[Object.keys(label).shift()];
};

module.exports = function tagSetToFormSchema(tagSet, options = {}) {
  const {
    lang = 'fr',
  } = options;
  return {
    fields: tagSet.groups.map(g => ({
      field: slug(flatten(g.name, lang).substr(0, 254), {
        lower: true,
        strict: true,
      }),
      label: g.name,
      fieldType: g.unique ? 'radio' : 'checkbox',
      info: g.info ?? null,
      options: g.tags.map(t => ({
        id: t.id,
        value: slug(flatten(t.label, lang).substr(0, 254), {
          lower: true, strict: true,
        }),
        label: t.label,
      })),
    })),
  };
};
