"use strict";

var schema = require('@openagenda/validators/schema');
var omit = require('lodash/omit');
var extend = require('lodash/extend');

schema.register({
  text: require('@openagenda/validators/text'),
  phone: require('@openagenda/validators/phone'),
  email: require('@openagenda/validators/email')
});

/**
 * stakeholder validator. Needs the fields settings to work
 */

module.exports = function (fields) {
  return schema(module.exports.convertFieldsToSchemaMap(fields));
};

module.exports.convertFieldsToSchemaMap = function (fields) {

  var s = {};

  fields.forEach(function (f) {

    s[f.field] = extend(omit(f, ['params', 'field']), f.params, { optional: false });
  });

  return s;
};
//# sourceMappingURL=validator.js.map