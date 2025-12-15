'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const boolean = require('@openagenda/validators/boolean');
const link = require('@openagenda/validators/link');
const number = require('@openagenda/validators/number');
const integer = require('@openagenda/validators/integer');
const date = require('@openagenda/validators/date');
const choice = require('@openagenda/validators/choice');
const email = require('@openagenda/validators/email');
const ip = require('@openagenda/validators/ip');
const pass = require('@openagenda/validators/pass');
const slug = require('../slugs/validator');
const fieldsByAccess = require('./fields/flattenedByFieldAccess');

schema.register({
  text,
  boolean,
  link,
  number,
  integer,
  date,
  slug,
  choice,
  email,
  ip,
  pass,
});

function objectify(fields) {
  return fields
    .filter((field) => {
      // Keep all fields except internal-write-only (system-generated)
      if (
        !field.write
        || field.write.length !== 1
        || field.write[0] !== 'internal'
      ) {
        return true;
      }
      // For internal-write-only fields, keep only editable ones
      const publicEditableFields = [
        'slug',
        'official',
        'networkUid',
        'locationSetUid',
      ];
      return publicEditableFields.includes(field.field);
    })
    .map((field) => _.omit(field, ['read', 'write']))
    .reduce((tree, field) => {
      const branches = field.field.split('.');
      const name = branches.pop();
      const path = branches
        .map((b) => [b, 'fields'].join('.'))
        .concat(name)
        .join('.');
      if (field.type === 'schema') {
        _.set(tree, path, _.omit({ ...field, fields: {} }, ['type', 'field']));
      } else {
        _.set(tree, path, _.omit(field, ['field']));
      }
      return tree;
    }, {});
}

module.exports = schema(objectify(fieldsByAccess.read.public));
