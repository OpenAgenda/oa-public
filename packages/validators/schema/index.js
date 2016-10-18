"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

var _listify = require('../listify');

var _listify2 = _interopRequireDefault(_listify);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _clean = require('./clean');

var _clean2 = _interopRequireDefault(_clean);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  fields: {}
};

var registeredValidators = { schema: schema };

module.exports = _utils2.default.extend(schema, { register: register });

function schema(options) {

  if (!options) {

    throw new Error('schema params missing at creation');
  }

  var params = _utils2.default.extend({ field: null, list: false }, defaults, options.fields ? options : { fields: options, root: true });

  if (params.root) {

    _utils2.default.extend(params, (0, _clean2.default)(params.fields));
  }

  /**
   * exposed endpoints
   */
  return _utils2.default.extend(params.list ? (0, _listify2.default)(validate) : validate, {
    part: part,
    default: _root2.default.getDefault(params.fields)
  });

  function validate(value) {

    var flattened = _root2.default.getFlat(params.fields, value);

    var errors = [],
        clean = {};

    flattened.forEach(function (flat) {

      try {

        clean[flat.field] = flat.validator(flat.value);
      } catch (errs) {

        errors = errors.concat(errs.map(function (e) {

          return params.field ? _utils2.default.extend({}, e, { field: params.field + '.' + e.field }) : e;
        }));
      }
    });

    if (errors.length) {

      throw errors;
    }

    return clean;
  }

  function part(path, value) {

    if (_utils2.default.isArray(path)) {

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

    var validator = registeredValidators[cursor.type](cursor);

    return validator(value);
  }

  function parts(paths, value) {

    var clean = {},
        errors = [];

    paths.forEach(function (p) {

      try {

        _utils2.default.deep.set(clean, p, part(p, _utils2.default.deep(value, p)));
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

  _root2.default.registerValidators(registeredValidators);
}