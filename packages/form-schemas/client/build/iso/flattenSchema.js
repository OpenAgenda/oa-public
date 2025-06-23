import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
const getFieldSlug = field => {
  var _field$slug;
  return (_field$slug = field.slug) !== null && _field$slug !== void 0 ? _field$slug : field.field;
};
const getPath = (parentPath, slug) => (parentPath !== null && parentPath !== void 0 ? parentPath : '').length ? "".concat(parentPath, ".").concat(slug) : slug;
const extractLanguages = label => typeof label === 'string' || !label ? [] : Object.keys(label);
const uniq = items => _reduceInstanceProperty(items).call(items, (deduped, item) => _includesInstanceProperty(deduped).call(deduped, item) ? deduped : deduped.concat(item), []);
const getLabel = (label, lang) => {
  if (!label) return label;
  if (typeof label === 'string') return label;
  if (label[lang]) return label[lang];
  return label[Object.keys(label).shift()];
};
const getMergedLabel = (fieldLabel, parentLabel) => {
  var _context;
  if (fieldLabel === undefined) {
    return fieldLabel;
  }
  if (typeof fieldLabel === 'string' && typeof parentLabel === 'string') {
    return [parentLabel, fieldLabel].join(': ');
  }
  return _reduceInstanceProperty(_context = uniq(extractLanguages(fieldLabel).concat(extractLanguages(parentLabel)))).call(_context, (label, lang) => _objectSpread(_objectSpread({}, label), {}, {
    [lang]: getMergedLabel(getLabel(fieldLabel, lang), getLabel(parentLabel, lang))
  }), {});
};
function getFlattenedSchemaFields(schema) {
  var _context2;
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    path,
    prefixedLabels,
    parent
  } = options;
  return _reduceInstanceProperty(_context2 = schema.fields).call(_context2, (fields, field) => {
    const fieldPath = getPath(path, getFieldSlug(field));
    if (field.schema) {
      return fields.concat(getFlattenedSchemaFields(field.schema, _objectSpread(_objectSpread({}, options), {}, {
        parent: field,
        path: getPath(path, fieldPath)
      })));
    }
    const flattenedField = _objectSpread(_objectSpread({}, field), {}, {
      field: fieldPath
    });
    const label = prefixedLabels && parent ? getMergedLabel(field.label, parent.label) : field.label;
    if (label) {
      flattenedField.label = label;
    }
    fields.push(flattenedField);
    return fields;
  }, []);
}
export default function getFlattenedSchema(schema) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const params = {
    path: '',
    prefixedLabels: false,
    parent: null
  };
  if (typeof options === 'string') {
    params.path = options;
  } else {
    Object.assign(params, options);
  }
  return _objectSpread(_objectSpread({}, schema), {}, {
    fields: getFlattenedSchemaFields(schema, options)
  });
}
//# sourceMappingURL=flattenSchema.js.map