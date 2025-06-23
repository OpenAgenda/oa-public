var _objectSpread = require("@babel/runtime-corejs3/helpers/objectSpread2").default;
const _ = require('lodash');
const formatErrors = require('./lib/errors');

/**
 * processes an array of values of potentially different
 * types. Throws a concatenation of all errors with
 * an index.
 */

module.exports = function list() {
  const validates = arguments.length === 1 && Array.isArray(arguments.length <= 0 ? undefined : arguments[0]) ? arguments.length <= 0 ? undefined : arguments[0] : arguments.length <= 1 ? undefined : arguments[1];
  const config = arguments.length === 1 && Array.isArray(arguments.length <= 0 ? undefined : arguments[0]) ? {} : arguments.length <= 0 ? undefined : arguments[0];
  const params = _objectSpread({
    field: null,
    optional: true,
    types: false,
    validators: false,
    validates: []
  }, config);
  if (validates) {
    params.validates = validates;
  } else {
    if (!params.types || !params.validators) {
      throw new Error('if list validators are not given, validators and types must be provided in config');
    }
    params.types.forEach(type => {
      if (params.validators[type] === undefined) {
        throw new Error("list validator requires ".concat(type, " validator to function"));
      }
      params.validates.push(params.validators[type]());
    });
  }
  function validateItem(item) {
    let decorated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const errors = [];
    let cleanItem;
    let type;
    params.validates.forEach(v => {
      if (cleanItem) return;
      try {
        type = v.type;
        cleanItem = v(item);
      } catch (err) {
        [].concat(err).forEach(e => errors.push(e));
      }
    });
    if (cleanItem !== undefined) {
      return decorated ? {
        value: cleanItem,
        type
      } : cleanItem;
    }
    if (decorated) {
      return {
        value: item,
        errors
      };
    }
    throw errors;
  }
  function validate(value) {
    let cleanOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const clean = [];
    const errors = [];
    if (params.optional && !value) {
      return clean;
    }
    if (params.optional && _.isArray(value) && !value.length) {
      return clean;
    }
    if (Array.isArray(value) && !params.optional && !value.length) {
      throw formatErrors(params, value, 'required', 'value cannot be empty');
    }
    if (!_.isArray(value)) {
      throw formatErrors(params, value, 'list.wrongtype', 'value should be a list');
    }
    value.forEach((item, i) => {
      try {
        clean.push(validateItem(item));
      } catch (errs) {
        errs.forEach(e => errors.push(_.extend({}, e, {
          index: i,
          field: params.field
        })));
      }
    });
    if (!cleanOnly && errors.length) throw errors;
    return clean;
  }
  function decorateItem(item) {
    return validateItem(item, true);
  }
  function decorate(value) {
    return (value || []).map(decorateItem);
  }
  return Object.assign(validate, {
    type: 'list',
    field: params.field,
    clean: v => validate(v, true),
    decorate,
    validateItem,
    decorateItem
  });
};
//# sourceMappingURL=list.js.map