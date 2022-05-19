import _ from 'lodash';
import listify from '../listify';
import schemaUtils from './utils';
import cleanSchema from './clean';
import withFieldValueMatches from './withFieldValueMatches';

const defaults = {
  fields: {}
};

function schema(options) {
  if (!options) {
    throw new Error('schema params missing at creation');
  }

  const params = {
    field: null,
    list: false,
    ...defaults,
    ...(options.fields ? options : { fields: options, root: true })
  };

  if (params.root) {
    Object.assign(params, cleanSchema(params.fields));
  }

  const defaultValue = schemaUtils.getDefault(params.fields);

  function validate(value) {
    const flattened = schemaUtils.mapValuesToValidators(params.fields, value, defaultValue);

    let errors = [];
    const clean = {};

    flattened.forEach(flat => {
      try {
        clean[flat.field] = flat.validator(flat.value);
      } catch (errs) {
        if (!_.isArray(errs)) throw errs;

        errors = errors.concat(errs.map(e => (
          params.field ? { ...e, field: `${params.field}.${e.field}` } : e
        )));
      }
    });

    if (errors.length) {
      throw errors;
    }

    return clean;
  }

  function parts(paths, value) {
    const clean = {};
    const errors = [];

    paths.forEach(p => {
      try {
        _.set(clean, p, part(p, _.get(value, p), value));
      } catch (errs) {
        [].concat(errs).forEach(err => errors.push(err));
      }
    });

    if (errors.length) throw errors;

    return clean;
  }

  function part(path, value, contextValues) {
    if (Array.isArray(path)) {
      return parts(path, value);
    }

    // only the values to be evaluated are provided
    if (_.isObject(path)) {
      const schemaFields = _.keys(params.fields);

      return parts(_.keys(path).filter(field => schemaFields.includes(field)), path);
    }

    let cursor = params.fields;

    const branches = path.split('.');

    const leaf = branches.pop();

    // dig down
    branches.forEach(b => {
      cursor = cursor[b].fields;
    });

    cursor = cursor[leaf];

    const type = cursor && cursor.type;

    if (!type) {
      throw {
        code: 'field.notdefined',
        message: 'field isn\'t defined',
        field: leaf
      };
    }

    if (cursor.enableWith && !withFieldValueMatches(cursor, 'enableWith', contextValues, params.fields)) {
      return;
    }

    const validator = registeredValidators[type](cursor);

    return validator(value);
  }

  if (params.field) {
    Object.assign(validate, { field: params.field });
  }

  /**
   * exposed endpoints
   */
  return _.assign(params.list ? listify(validate, params) : validate, {
    part,
    defaultValue, // .default is not tolerated by ie8
    default: defaultValue,
    fields: params.fields,
    type: 'schema',
    struct: params.root ? options : params.fields, // legacy
  });
}

const registeredValidators = { schema };

function register(v) {
  Object.keys(v).forEach(k => {
    registeredValidators[k] = v[k];
  });

  schemaUtils.registerValidators(registeredValidators);
}

export default Object.assign(schema, { register });
