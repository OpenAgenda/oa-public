'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

module.exports = (fields, params, obj) => {
  const { lang: preferredLang, fallbackLang = 'en' } = params;

  return ih(
    obj,
    fields.reduce((update, field) => {
      const fieldValue = _.get(obj, field);

      if (!fieldValue) {
        return update;
      }

      return _.set(update, field, {
        $set:
          fieldValue[preferredLang]
          ?? fieldValue[fallbackLang]
          ?? fieldValue[Object.keys(fieldValue).shift()],
      });
    }, {}),
  );
};
