"use strict";

var utils = require('utils'),
    text = require('./text');

module.exports = function (config) {

  var params = utils.extend({
    field: false,
    optional: true,
    defaultLanguage: 'en'
  }, config || {});

  return utils.extend(validate, {
    type: 'multilingual',
    field: params.field
  });

  function validate(value) {

    var clean = {},
        tmp = {},
        errors = [],
        validateText = text(params);

    if (typeof value === 'string') {

      tmp[params.defaultLanguage] = value;

      value = tmp;
    };

    if (!value) value = {};

    Object.keys(value).forEach(function (l) {

      var langValue = value[l];

      if (langValue === undefined || langValue === null) {

        return;
      }

      try {

        clean[l] = validateText(langValue);
      } catch (lErrors) {

        errors = errors.concat(lErrors.map(function (e) {
          return utils.extend({ lang: l }, e);
        }));
      }
    });

    if (errors.length) {

      throw errors;
    }

    return clean;
  }
};