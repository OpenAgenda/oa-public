import _ from 'lodash';
import ih from 'immutability-helper';
import isObject from './isObject.js';
import { extractNextOptionId } from './fieldOptions.js';
import validateFieldAndAssignOptionIds from './validateFieldAndAssignOptionIds.js';
import validateSection from './validateSection.js';
import getSchema from './getSchema.js';
import isFieldReferencedByField from './isFieldReferencedByField.js';

const isNew = (data) => data.id === null;

const getItemSlug = (f) => f.slug ?? f.field;
const getItemType = (f) => f.type ?? 'field';

function validate(data, options = {}) {
  const { client, requireLabels, reservedFields } = {
    client: false,
    requireLabels: true,
    reservedFields: [],
    ...typeof options === 'boolean'
      ? {
        client: options,
      }
      : options,
  };

  let errors = [];

  const dirty = {
    id: null,
    nextOptionId: 1,
    fields: [],
    res: null,
    custom: null,
    defaultLabelLanguage: null,
    ...data || {},
  };

  // these we take as is
  const clean = _.pick(dirty, ['id', 'res', 'custom', 'defaultLabelLanguage']);

  clean.nextOptionId = extractNextOptionId(data);

  clean.fields = [];

  const usedSlugs = new Set();

  // clean each field
  dirty.fields.forEach((f) => {
    try {
      if (f.type === 'section') {
        clean.fields.push(validateSection(f));
        return;
      }

      const { field: cleanField, nextOptionId: updatedNextOptionId } = validateFieldAndAssignOptionIds(f, {
        requireLabels,
        custom: clean.custom,
        defaultLabelLanguage: clean.defaultLabelLanguage,
        nextOptionId: clean.nextOptionId,
      });

      const fieldSlug = getItemSlug(cleanField);

      // Check if slug is reserved
      if (reservedFields.includes(fieldSlug)) {
        throw new Error(
          `Field slug "${fieldSlug}" is reserved and cannot be used`,
        );
      }

      // Check if slug is duplicate
      if (usedSlugs.has(fieldSlug)) {
        throw new Error(
          `Field slug "${fieldSlug}" is already used in the schema`,
        );
      }

      usedSlugs.add(fieldSlug);

      clean.nextOptionId = updatedNextOptionId;

      clean.fields.push(cleanField);
    } catch (e) {
      if (!Array.isArray(e)) {
        const error = {
          ...e,
          message: `Validation of field ${f.field} failed: ${e.message}`,
        };
        throw error;
      }

      errors = errors.concat(e);
    }
  });

  if (errors.length) {
    throw errors;
  }

  return client ? clean : _.omit(clean, ['res', 'id']);
}

class FormSchema {
  constructor(data, options = {}) {
    // { fields, nextOptionId, res, id, custom }
    this.data = validate(data, {
      client: true,
      ...typeof options === 'boolean' ? { client: options } : options,
    });
    this.reservedFields = options.reservedFields || [];
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

    const { field: clean, nextOptionId } = validateFieldAndAssignOptionIds(
      fieldData,
      _.pick(this.data, ['custom', 'defaultLabelLanguage', 'nextOptionId']),
    );

    const itemSlug = getItemSlug(clean);

    // Check if slug is reserved
    if (this.reservedFields.includes(itemSlug)) {
      const error = `Field slug "${itemSlug}" is reserved and cannot be used`;
      throw new Error(error);
    }

    // Check if slug is already used
    if (!this.isItemSlugAvailable(clean)) {
      const error = `Field slug "${itemSlug}" is already used in the schema`;
      throw new Error(error);
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

    const { field: clean, nextOptionId } = validateFieldAndAssignOptionIds(
      fieldData,
      _.pick(this.data, ['custom', 'defaultLabelLanguage', 'nextOptionId']),
    );

    const fieldIndex = this._getFieldIndex(getItemSlug(clean));
    const itemSlug = getItemSlug(clean);
    const oldSlug = getItemSlug(this.data.fields[fieldIndex]);

    // Check if slug is being changed to a reserved one
    if (itemSlug !== oldSlug && this.reservedFields.includes(itemSlug)) {
      const error = `Field slug "${itemSlug}" is reserved and cannot be used`;
      throw new Error(error);
    }

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
    const field = typeof fieldOrFieldName === 'string'
      ? this.getField(fieldOrFieldName)
      : fieldOrFieldName;

    return this.data.fields.filter(
      (f) =>
        isFieldReferencedByField(field, f)
        || isFieldReferencedByField(f, field),
    );
  }

  getFileFields() {
    return this.data.fields.filter((f) =>
      ['image', 'file'].includes(f.fieldType));
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
    return !this.data.fields.filter((f) => getItemSlug(f) === getItemSlug(item))
      .length;
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
    const updatedFieldSlugs = fields.map((f) => getItemSlug(f));

    // remove
    _.get(this, 'data.fields')
      .filter((f) => !updatedFieldSlugs.includes(getItemSlug(f)))
      .forEach((fieldToRemove) => this.removeField(getItemSlug(fieldToRemove)));

    // add and update
    fields.forEach((f) => {
      if (this.getFieldExists(getItemSlug(f))) {
        try {
          this.updateField(f);
        } catch (errors) {
          throw errors.map((e) => ({ ...e, field: `${f.field}.${e.field}` }));
        }
      } else {
        this.addField(f);
      }
    });

    fields.map((f, i) => this.moveFieldTo(f.slug ?? f.field, i));

    return this.data.fields;
  }

  getValidate(accessType = null, accessLevel = null, options = {}) {
    const args = isObject(accessType)
      ? {
        accessType: null,
        accessLevel: null,
        options: accessType,
      }
      : {
        accessType,
        accessLevel,
        options,
      };

    return getSchema(
      this.data.fields,
      args.accessType,
      args.accessLevel,
      ih(args.options, {
        custom: {
          $set: this.data.custom,
        },
      }),
    );
  }

  getFieldExists(indexOrSlug) {
    if (typeof indexOrSlug === 'string') {
      return this._getFieldIndex(indexOrSlug) !== -1;
    }

    return indexOrSlug < this.data.fields.length;
  }

  _getFieldIndex(indexOrSlug) {
    const fieldNames = this.data.fields.map((f) => f.slug ?? f.field);

    return typeof indexOrSlug === 'string'
      ? fieldNames.indexOf(indexOrSlug)
      : indexOrSlug;
  }

  _checkFieldIndex(index, errorMessage = 'Index exceeds schema size') {
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
