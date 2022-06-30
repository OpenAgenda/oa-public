import _ from 'lodash';
import ih from 'immutability-helper';
import labelKeys from './labelKeys';

function restrictLabelLanguages(field, languages = []) {
  return ih(field, labelKeys
    .filter(labelKey => field[labelKey])
    .reduce((updates, labelKey) => {
      const currentLabelLanguages = _.isString(field[labelKey]) ? [] : _.keys(field[labelKey]);

      const fillerLabel = currentLabelLanguages.length ? field[labelKey][currentLabelLanguages[0]] : field[labelKey];

      return _.set(updates, labelKey, {
        $set: languages.length ? languages.reduce((labelValue, language) => _.set(
          labelValue, language, currentLabelLanguages.includes(language) ? field[labelKey][language] : fillerLabel
        ), {}) : fillerLabel
      });
    }, {}));
}

function applyToSchema(schema, languages = []) {
  if (!_.get(schema, 'fields', []).length) return schema;

  return ih(schema, {
    fields: {
      $set: schema.fields.map(f => restrictLabelLanguages(f, languages))
    }
  });
}

export default Object.assign(restrictLabelLanguages, {
  applyToSchema
});
