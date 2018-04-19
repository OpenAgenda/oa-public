"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var utils = require('@openagenda/utils'),
    slug = require('slug');

/**
 * format custom values from and to fields
 * tested in file of same name
 */

module.exports = {
  getFieldValues: getFieldValues,
  getValues: getValues,
  test: {
    _areFieldValues: _areFieldValues
  }
};

function getFieldValues(data, settings) {

  var values = getValues(data, settings),
      fieldValues = {};

  Object.keys(values).forEach(function (k) {

    fieldValues[utils.toUnderscore(k)] = _typeof(values[k]) === 'object' ? values[k].label : values[k];
  });

  return fieldValues;
}

function getValues(data, settings) {

  if (!_areFieldValues(data, settings)) return data;

  var values = {};

  Object.keys(data).forEach(function (k) {

    var fieldSettings = settings.fields.filter(function (f) {
      return f.field === k;
    });

    if (!fieldSettings.length) return;

    if (fieldSettings[0].slugged) {

      values[k] = {
        label: data[k],
        slug: slug(data[k], { lower: true })
      };
    } else {

      values[k] = data[k];
    }
  });

  return utils.toCamelCase(values);
}

function _areFieldValues(data, settings) {

  // if there are slugs, then data are values
  var fieldSettings = settings.fields.filter(function (f) {
    return f.slugged;
  });

  if (fieldSettings.length && _typeof(data[fieldSettings[0].field]) === 'object') {

    return false;
  }

  // if there are underscored keys then data is field values
  return !!Object.keys(data).filter(function (k) {
    return k.indexOf('_') !== -1;
  }).length;
}
//# sourceMappingURL=customFormat.js.map