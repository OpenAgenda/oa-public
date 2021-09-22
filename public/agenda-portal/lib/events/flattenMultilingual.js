'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

module.exports = (fields, preferredlang, obj) => ih(
  obj,
  fields.reduce(
    (update, field) => {
      const fieldValue = _.get(obj, field);

      return _.set(update, field, {
        $set: _.get(
          fieldValue,
          preferredlang,
          _.get(fieldValue, _.first(_.keys(fieldValue)))
        ),
      });
    },
    {}
  )
);
