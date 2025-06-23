import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _get from "lodash/get.js";
import _omit from "lodash/omit.js";
import _pick from "lodash/pick.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import ih from 'immutability-helper';
import isObject from './isObject.js';
import { extractNextOptionId } from './fieldOptions.js';
import validateFieldAndAssignOptionIds from './validateFieldAndAssignOptionIds.js';
import validateSection from './validateSection.js';
import getSchema from './getSchema.js';
import isFieldReferencedByField from './isFieldReferencedByField.js';
const isNew = data => data.id === null;
const getItemSlug = f => {
  var _f$slug;
  return (_f$slug = f.slug) !== null && _f$slug !== void 0 ? _f$slug : f.field;
};
const getItemType = f => {
  var _f$type;
  return (_f$type = f.type) !== null && _f$type !== void 0 ? _f$type : 'field';
};
function validate(data) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    client,
    requireLabels
  } = _objectSpread({
    client: false,
    requireLabels: true
  }, typeof options === 'boolean' ? {
    client: options
  } : options);
  let errors = [];
  const dirty = _objectSpread({
    id: null,
    nextOptionId: 1,
    fields: [],
    res: null,
    custom: null,
    defaultLabelLanguage: null
  }, data || {});

  // these we take as is
  const clean = _pick(dirty, ['id', 'res', 'custom', 'defaultLabelLanguage']);
  clean.nextOptionId = extractNextOptionId(data);
  clean.fields = [];

  // clean each field
  dirty.fields.forEach(f => {
    try {
      if (f.type === 'section') {
        clean.fields.push(validateSection(f));
        return;
      }
      const {
        field: cleanField,
        nextOptionId: updatedNextOptionId
      } = validateFieldAndAssignOptionIds(f, {
        requireLabels,
        custom: clean.custom,
        defaultLabelLanguage: clean.defaultLabelLanguage,
        nextOptionId: clean.nextOptionId
      });
      clean.nextOptionId = updatedNextOptionId;
      clean.fields.push(cleanField);
    } catch (e) {
      if (!Array.isArray(e)) {
        const error = _objectSpread(_objectSpread({}, e), {}, {
          message: "Validation of field ".concat(f.field, " failed: ").concat(e.message)
        });
        throw error;
      }
      errors = errors.concat(e);
    }
  });
  if (errors.length) {
    throw errors;
  }
  return client ? clean : _omit(clean, ['res', 'id']);
}
class FormSchema {
  constructor(data) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // { fields, nextOptionId, res, id, custom }
    this.data = validate(data, _objectSpread({
      client: true
    }, typeof options === 'boolean' ? {
      client: options
    } : options));
  }

  // get clean data
  getData() {
    return this.data;
  }
  addField(fieldData) {
    if (getItemType(fieldData) === 'section') {
      this.data.fields.push(validateSection(fieldData));
      return;
    }
    const {
      field: clean,
      nextOptionId
    } = validateFieldAndAssignOptionIds(fieldData, _pick(this.data, ['custom', 'defaultLabelLanguage', 'nextOptionId']));
    if (!this.isItemSlugAvailable(clean)) {
      const error = "This slug is taken! : ".concat(clean.field);
      throw error;
    }
    this.data.nextOptionId = nextOptionId;
    this.data.fields.push(clean);
  }
  updateField(fieldData) {
    if (getItemType(fieldData) === 'section') {
      const clean = validateSection(fieldData);
      this.data.fields.splice(this._getFieldIndex(clean.slug), 1, clean);
      return;
    }
    const {
      field: clean,
      nextOptionId
    } = validateFieldAndAssignOptionIds(fieldData, _pick(this.data, ['custom', 'defaultLabelLanguage', 'nextOptionId']));
    const fieldIndex = this._getFieldIndex(getItemSlug(clean));
    this.data.nextOptionId = nextOptionId;
    this.data.fields.splice(fieldIndex, 1, clean);
  }
  getField(indexOrSlug) {
    const index = this._getFieldIndex(indexOrSlug);
    this._checkFieldIndex(index);
    return this.data.fields[index];
  }
  getFields() {
    return this.data.fields;
  }
  getRelatedFields(fieldOrFieldName) {
    const field = typeof fieldOrFieldName === 'string' ? this.getField(fieldOrFieldName) : fieldOrFieldName;
    return this.data.fields.filter(f => isFieldReferencedByField(field, f) || isFieldReferencedByField(f, field));
  }
  getFileFields() {
    return this.data.fields.filter(f => {
      var _context;
      return _includesInstanceProperty(_context = ['image', 'file']).call(_context, f.fieldType);
    });
  }
  moveField(indexOrSlug, moves) {
    const index = this._getFieldIndex(indexOrSlug);
    this.moveFieldTo(index, index + moves);
  }
  moveFieldTo(indexOrSlug, newIndex) {
    const index = this._getFieldIndex(indexOrSlug);
    this._checkFieldIndex(newIndex, 'Move value exceeds possible value');
    const field = this._popField(index);
    this.data.fields.splice(newIndex, 0, field);
  }
  removeField(indexOrSlug) {
    const index = this._getFieldIndex(indexOrSlug);
    this._checkFieldIndex(index);
    this._popField(index);
  }
  isItemSlugAvailable(item) {
    return !this.data.fields.filter(f => getItemSlug(f) === getItemSlug(item)).length;
  }
  getFieldCount() {
    return this.data.fields.length;
  }
  isEmpty() {
    return !this.data.fields.length;
  }
  isNew() {
    return isNew(this.data);
  }
  updateFields(fields) {
    const updatedFieldSlugs = fields.map(f => getItemSlug(f));

    // remove
    _get(this, 'data.fields').filter(f => !_includesInstanceProperty(updatedFieldSlugs).call(updatedFieldSlugs, getItemSlug(f))).forEach(fieldToRemove => this.removeField(getItemSlug(fieldToRemove)));

    // add and update
    fields.forEach(f => {
      if (this.getFieldExists(getItemSlug(f))) {
        try {
          this.updateField(f);
        } catch (errors) {
          throw errors.map(e => _objectSpread(_objectSpread({}, e), {}, {
            field: "".concat(f.field, ".").concat(e.field)
          }));
        }
      } else {
        this.addField(f);
      }
    });
    fields.map((f, i) => {
      var _f$slug2;
      return this.moveFieldTo((_f$slug2 = f.slug) !== null && _f$slug2 !== void 0 ? _f$slug2 : f.field, i);
    });
    return this.data.fields;
  }
  getValidate() {
    let accessType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let accessLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const args = isObject(accessType) ? {
      accessType: null,
      accessLevel: null,
      options: accessType
    } : {
      accessType,
      accessLevel,
      options
    };
    return getSchema(this.data.fields, args.accessType, args.accessLevel, ih(args.options, {
      custom: {
        $set: this.data.custom
      }
    }));
  }
  getFieldExists(indexOrSlug) {
    if (typeof indexOrSlug === 'string') {
      return this._getFieldIndex(indexOrSlug) !== -1;
    }
    return indexOrSlug < this.data.fields.length;
  }
  _getFieldIndex(indexOrSlug) {
    const fieldNames = this.data.fields.map(f => {
      var _f$slug3;
      return (_f$slug3 = f.slug) !== null && _f$slug3 !== void 0 ? _f$slug3 : f.field;
    });
    return typeof indexOrSlug === 'string' ? fieldNames.indexOf(indexOrSlug) : indexOrSlug;
  }
  _checkFieldIndex(index) {
    let errorMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Index exceeds schema size';
    if (index < 0 || index >= this.getFieldCount()) {
      throw errorMessage;
    }
  }
  _popField(index) {
    return this.data.fields.splice(index, 1)[0];
  }
}
FormSchema.validate = validate;
export default FormSchema;
export { validate };
//# sourceMappingURL=FormSchema.js.map