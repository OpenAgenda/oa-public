import ih from 'immutability-helper';
import labelKeys from './labelKeys';

function restrictLabelLanguages(field, languages = []) {
  const restricted = ih(field, labelKeys
    .filter(labelKey => field[labelKey])
    .reduce((updates, labelKey) => {
      const currentLabelLanguages = typeof field[labelKey] === 'string' ? [] : Object.keys(field[labelKey]);

      const fillerLabel = currentLabelLanguages.length ? field[labelKey][currentLabelLanguages[0]] : field[labelKey];

      return {
        ...updates,
        [labelKey]: {
          $set: languages.length ? languages.reduce((labelValue, language) => ({
            ...labelValue,
            [language]: currentLabelLanguages.includes(language) ? field[labelKey][language] : fillerLabel,
          }), {}) : fillerLabel,
        },
      };
    }, {}));

  if (restricted.options) {
    restricted.options = restricted.options.map(o => restrictLabelLanguages(o, languages));
  }

  return restricted;
}

function applyToSchema(schema, languages = []) {
  if ((!schema?.fields ?? []).length) {
    return schema;
  }

  return ih(schema, {
    fields: {
      $set: schema.fields.map(f => restrictLabelLanguages(f, languages)),
    },
  });
}

export default Object.assign(restrictLabelLanguages, {
  applyToSchema,
});
