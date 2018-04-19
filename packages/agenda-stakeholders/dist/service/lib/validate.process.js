"use strict";

/**
 * for use in update & create processes
 */

var Stakeholder = require('../../iso/Stakeholder'),
    validator = require('../../iso/validator'),
    _ = require('lodash');

module.exports = function (_ref, cb) {
  var data = _ref.data,
      allowPartial = _ref.allowPartial,
      settings = _ref.settings;


  settings.get(function (err, s) {

    if (err) return cb(err);

    // handle camel-cased fields only
    var fields = s.fields.map(function (f) {
      return _.extend({}, f, { field: _.camelCase(f.field) });
    });

    // settings fields follow a legacy structure ( list of fields )
    // that must be converted to a 'validators/schema' friendly map
    var stakeholder = new Stakeholder(_preClean(data), {
      schemaMap: validator.convertFieldsToSchemaMap(fields)
    }),
        valid = stakeholder.isValid(allowPartial);

    cb(null, valid, valid, stakeholder.getErrors(allowPartial));
  });
};

/**
 * data may come in underscored field name version
 * shifting to camelCase only.
 */
function _preClean(data) {

  var c = _.mapKeys(data, function (v, k) {
    return _.camelCase(k);
  });

  if (!c || !_.isObject(c)) return c;

  if (!c.organization || !_.isObject(c.organization)) return c;

  return _.extend({}, c, { organization: c.organization.label });
}
//# sourceMappingURL=validate.process.js.map