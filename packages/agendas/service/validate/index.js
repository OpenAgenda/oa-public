import _ from 'lodash';
import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';
import boolean from '@openagenda/validators/boolean.js';
import link from '@openagenda/validators/link.js';
import integer from '@openagenda/validators/integer.js';
import date from '@openagenda/validators/date.js';
import choice from '@openagenda/validators/choice.js';
import email from '@openagenda/validators/email.js';
import ip from '@openagenda/validators/ip.js';
import pass from '@openagenda/validators/pass.js';
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
