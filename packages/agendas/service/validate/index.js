import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';
import text from '@openagenda/validators/text';
import boolean from '@openagenda/validators/boolean';
import link from '@openagenda/validators/link';
import integer from '@openagenda/validators/integer';
import date from '@openagenda/validators/date';
import choice from '@openagenda/validators/choice';
import email from '@openagenda/validators/email';
import ip from '@openagenda/validators/ip';
import pass from '@openagenda/validators/pass';
import slug from './slug.js';
import fieldsByAccess from './fields/flattenedByFieldAccess.js';

schema.register({
  text,
  boolean,
  link,
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

export default schema(objectify(fieldsByAccess.read.internal));
