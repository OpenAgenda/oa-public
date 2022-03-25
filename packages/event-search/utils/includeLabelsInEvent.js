'use strict';

function extractLabel(label, requestedLang) {
  if (!label || !(label instanceof Object)) {
    return label;
  }

  return label[Object.keys(label).reduce((chosen, lang, index) => {
    if (chosen) {
      return chosen;
    }
    if (index === 0) {
      return lang;
    }
    return label[requestedLang] ? lang : undefined;
  })];
}

module.exports = function includeLabelsInEvent({ formSchema, monolingual }, event) {
  return formSchema.fields.reduce((draft, { field, options }) => {
    if (!options || !draft[field]) {
      return draft;
    }

    const corresponding = [].concat(draft[field])
      .map(value => options.find(o => o.id === value))
      .map(option => ({
        id: option.id,
        label: monolingual ? extractLabel(option.label, monolingual) : option.label
      }));

    return {
      ...draft,
      [field]: Array.isArray(draft[field]) ? corresponding : corresponding.pop()
    };
  }, event);
}