"use strict";

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _listify = require('../listify');

var _listify2 = _interopRequireDefault(_listify);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _clean = require('./clean');

var _clean2 = _interopRequireDefault(_clean);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var defaults = {
  fields: {}
};

var registeredValidators = { schema: schema };

module.exports = (0, _extend2['default'])(schema, { register: register });

function schema(options) {

  if (!options) {

    throw new Error('schema params missing at creation');
  }

  var params = (0, _extend2['default'])({ field: null, list: false }, defaults, options.fields ? options : { fields: options, root: true });

  if (params.root) {

    (0, _extend2['default'])(params, (0, _clean2['default'])(params.fields));
  }

  if (params.field) {

    (0, _extend2['default'])(validate, { field: params.field });
  }

  var defaultValue = _root2['default'].getDefault(params.fields);

  /**
   * exposed endpoints
   */
  return (0, _extend2['default'])(params.list ? (0, _listify2['default'])(validate, params) : validate, {
    part: part,
    defaultValue: defaultValue, // .default is not tolerated by ie8
    'default': defaultValue,
    fields: params.fields,
    type: 'schema',
    struct: params.root ? options : params.fields // legacy
  });

  function validate(value) {

    var flattened = _root2['default'].getFlat(params.fields, value);

    var errors = [],
        clean = {};

    flattened.forEach(function (flat) {

      try {

        clean[flat.field] = flat.validator(flat.value);
      } catch (errs) {

        errors = errors.concat(errs.map(function (e) {

          return params.field ? (0, _extend2['default'])({}, e, { field: params.field + '.' + e.field }) : e;
        }));
      }
    });

    if (errors.length) {

      throw errors;
    }

    return clean;
  }

  function part(path, value) {

    if ((0, _isArray2['default'])(path)) {

      return parts(path, value);
    }

    var cursor = params.fields,
        branches = path.split('.'),
        leaf = branches.pop();

    // dig down
    branches.forEach(function (b) {

      cursor = cursor[b].fields;
    });

    cursor = cursor[leaf];

    var type = cursor && cursor.type;

    if (!type) {

      throw {
        code: 'field.notdefined',
        message: 'field isn\'t defined',
        field: leaf
      };
    }

    var validator = registeredValidators[type](cursor);

    return validator(value);
  }

  function parts(paths, value) {

    var clean = {},
        errors = [];

    paths.forEach(function (p) {

      try {

        _utils2['default'].deep.set(clean, p, part(p, _utils2['default'].deep(value, p)));
      } catch (errs) {

        errors = errors.concat(errs);
      }
    });

    if (errors.length) throw errors;

    return clean;
  }
}

function register(v) {

  Object.keys(v).forEach(function (k) {

    registeredValidators[k] = v[k];
  });

  _root2['default'].registerValidators(registeredValidators);
}
//# sourceMappingURL=index.js.map