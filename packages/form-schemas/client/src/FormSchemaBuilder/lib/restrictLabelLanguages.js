import ih from 'immutability-helper';
import labelKeys from './labelKeys.js';

function extractFillerLabel(label, languages) {
  if (languages.length) {
    return label[languages[0]];
  }

  if (typeof label === 'string') {
    return label;
  }
}

function restrictLabelLanguages(field, languages = []) {
  const restricted = ih(
    field ?? {},
    labelKeys
      .filter((labelKey) => field?.[labelKey])
      .reduce((updates, labelKey) => {
        const currentLabelLanguages = typeof field[labelKey] === 'string'
          ? []
          : Object.keys(field[labelKey]);

        const fillerLabel = extractFillerLabel(
          field[labelKey],
          currentLabelLanguages,
        );

        return {
          ...updates,
          [labelKey]: {
            $set: languages.length
              ? languages.reduce(
                (labelValue, language) => ({
                  ...labelValue,
                  [language]: currentLabelLanguages.includes(language)
                    ? field[labelKey][language]
                    : fillerLabel,
                }),
                {},
              )
              : fillerLabel,
          },
        };
      }, {}),
  );

  if (restricted.options) {
    restricted.options = restricted.options.map((o) =>
      restrictLabelLanguages(o, languages));
  }

  return restricted;
}

function applyToSchema(schema, languages = []) {
  if ((!schema?.fields ?? []).length) {
    return schema;
  }

  return ih(schema, {
    fields: {
      $set: schema.fields.map((f) => restrictLabelLanguages(f, languages)),
    },
  });
}

export default Object.assign(restrictLabelLanguages, {
  applyToSchema,
});
