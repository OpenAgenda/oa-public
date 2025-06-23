import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _last from "lodash/last.js";
import _first from "lodash/first.js";
import _get from "lodash/get.js";
import _set from "lodash/set.js";
import _keys from "lodash/keys.js";
import _uniq from "lodash/uniq.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import ih from 'immutability-helper';
const getIsAbstract = _ref => {
  let {
    fieldType,
    type
  } = _ref;
  if (type === 'abstract') {
    return true;
  }
  return (fieldType !== null && fieldType !== void 0 ? fieldType : 'abstract') === 'abstract';
};
const assignSchemaValuesToNonAbstractFields = schema => ({
  custom: (schema === null || schema === void 0 ? void 0 : schema.custom) || {},
  fields: ((schema === null || schema === void 0 ? void 0 : schema.fields) || []).map(f => {
    const isAbstract = getIsAbstract(f);
    return _objectSpread(_objectSpread({}, f), {}, {
      schemaId: isAbstract ? null : schema.id || null,
      schemaType: isAbstract ? null : schema.type || null
    });
  })
});
function mergeRelated(relateds) {
  var _context;
  return _reduceInstanceProperty(_context = relateds.map(related => Array.isArray(related) ? {
    other: related
  } : related)).call(_context, (merged, related) => {
    if (!related) {
      return merged;
    }
    Object.keys(related).forEach(relatedKey => {
      var _merged$relatedKey;
      merged[relatedKey] = _uniq((_merged$relatedKey = merged[relatedKey]) !== null && _merged$relatedKey !== void 0 ? _merged$relatedKey : []).concat(related[relatedKey]);
    });
    return merged;
  }, {});
}
function mergeField(field, mergeWithField) {
  var _context2;
  if (!mergeWithField) return field;
  const protectedKeys = ['field', 'fieldType', 'origin', 'type', 'slug'];
  const update = _reduceInstanceProperty(_context2 = _keys(mergeWithField).filter(k => !_includesInstanceProperty(protectedKeys).call(protectedKeys, k)).filter(f => mergeWithField[f] !== undefined)).call(_context2, (c, f) => _set(c, f, {
    $set: mergeWithField[f]
  }), {});
  if (field.optional && mergeWithField.optional === false) {
    update.optional = {
      $set: false
    };
  }
  if (_get(mergeWithField, 'allowedOptions')) {
    update.options = {
      $set: _get(field, 'options').filter(o => {
        var _context3;
        return _includesInstanceProperty(_context3 = mergeWithField.allowedOptions).call(_context3, o.id);
      })
    };
    update.$unset = ['allowedOptions'];
  }
  if (field.schemaId) {
    update.schemaId = {
      $set: field.schemaId
    };
  }
  if (field.schemaType) {
    update.schemaType = {
      $set: field.schemaType
    };
  }
  if (field.related || mergeWithField.related) {
    update.related = {
      $set: mergeRelated([field.related, mergeWithField.related])
    };
  }
  if (!_keys(update).length) return field;
  return ih(field, update);
}
function reduceFields(mergedIn, mergeWith) {
  var _context4;
  if (!_get(mergeWith, 'fields')) {
    return mergedIn;
  }
  if (!_get(mergedIn, 'fields')) {
    return mergeWith;
  }
  return _objectSpread(_objectSpread({}, mergedIn), {}, {
    fields: _reduceInstanceProperty(_context4 = assignSchemaValuesToNonAbstractFields(mergeWith).fields.concat(mergedIn.fields)).call(_context4, (fields, field) => {
      var _field$slug;
      const index = fields.map(f => {
        var _f$slug;
        return (_f$slug = f.slug) !== null && _f$slug !== void 0 ? _f$slug : f.field;
      }).indexOf((_field$slug = field.slug) !== null && _field$slug !== void 0 ? _field$slug : field.field);
      if (index === -1) {
        fields.push(field);
      } else {
        fields[index] = mergeField(field, fields[index]);
      }
      return fields;
    }, [])
  });
}
function mergeAll() {
  var _context5;
  const options = {
    access: null
  };
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  if (args.length === 1) return _first(args);
  if (_last(args) && _last(args).access !== undefined) {
    Object.assign(options, args.pop());
  }
  const merged = _reduceInstanceProperty(_context5 = args.slice(1)).call(_context5, reduceFields, assignSchemaValuesToNonAbstractFields(args[0]));
  if (!options.access) return merged;
  const accessTypes = Object.keys(options.access);
  return _objectSpread(_objectSpread({}, merged), {}, {
    fields: merged.fields.filter(f => accessTypes.length === accessTypes.filter(accessType => {
      var _context6;
      return !f[accessType] || _includesInstanceProperty(_context6 = f[accessType]).call(_context6, options.access[accessType]);
    }).length)
  });
}
export default mergeAll;
//# sourceMappingURL=merge.js.map