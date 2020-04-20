'use strict';

const _ = require('lodash');
const fieldsByAccess = require('./flattenedByFieldAccess');

function objectify(fields, obj = {}) {
  return fields.map(field => _.omit(field, ['read', 'write'])).reduce((tree, field) => {
    const branches = field.field.split('.');
    const name = branches.pop();
    const path = branches.map(b => [b, 'fields'].join('.')).concat(name).join('.');
    if (field.type === 'schema') {
      _.set(tree, path, _.omit({ ...field, fields: {} }, ['type', 'field']));
    } else {
      _.set(tree, path, _.omit(field, ['field']));
    }
    return tree;
  }, {});
}

module.exports = {
  public: objectify(fieldsByAccess.read.legacyPublic),
  all: objectify(fieldsByAccess.read.legacy),
  private: objectify(fieldsByAccess.read.legacyPrivate)
};
