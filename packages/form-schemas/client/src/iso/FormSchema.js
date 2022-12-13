const _ = require('lodash');
const ih = require('immutability-helper');

const isObject = require('./isObject');

const {
  extractNextOptionId,
} = require('./fieldOptions');

const validateFieldAndAssignOptionIds = require('./validateFieldAndAssignOptionIds');
const validateSection = require('./validateSection');

const getSchema = require('./getSchema');
const getWithFieldName = require('./getWithFieldName');

const isNew = data => data.id === null;

const getItemSlug = f => f.slug ?? f.field;

function validate(data, options = {}) {
  const {
    client,
    requireLabels,
  } = {
    client: false,
    requireLabels: true,
    ...typeof options === 'boolean' ? {
      client: options,
    } : options,
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
  const clean = _.pick(dirty, [
    'id',
    'res',
    'custom',
    'defaultLabelLanguage',
  ]);

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
        nextOptionId: updatedNextOptionId,
      } = validateFieldAndAssignOptionIds(f, {
        requireLabels,
        custom: clean.custom,
        defaultLabelLanguage: clean.defaultLabelLanguage,
        nextOptionId: clean.nextOptionId,
      });

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

module.exports = class {
  constructor(data, options = {}) {
    // { fields, nextOptionId, res, id, custom }
    this.data = validate(data, {
      client: true,
      ...typeof options === 'boolean' ? { client: options } : options,
    });
  }

  // get clean data
  getData() {
    return this.data;
  }

  addField(fieldData) {
    if (fieldData?.type ?? 'field' === 'section') {
      this.data.fields.push(validateSection(fieldData));
      return;
    }

    const {
      field: clean,
      nextOptionId,
    } = validateFieldAndAssignOptionIds(fieldData, _.pick(this.data, [
      'custom', 'defaultLabelLanguage', 'nextOptionId',
    ]));

    if (!this.isFieldNameAvailable(clean.field)) {
      const error = `This field name is taken! : ${clean.field}`;
      throw error;
    }

    this.data.nextOptionId = nextOptionId;

    this.data.fields.push(clean);
  }

  updateField(fieldData) {
    if (fieldData?.type ?? 'field' === 'section') {
      const clean = validateSection(fieldData);

      this.data.fields.splice(
        this._getFieldIndex(clean.slug),
        1,
        clean,
      );
      return;
    }

    const {
      field: clean,
      nextOptionId,
    } = validateFieldAndAssignOptionIds(fieldData, _.pick(this.data, [
      'custom', 'defaultLabelLanguage', 'nextOptionId',
    ]));

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

  getRelatedFields(field) {
    const referenceFieldName = field.field;
    const optionalWithFieldName = getWithFieldName(field.optionalWith);
    const enableWithFieldName = getWithFieldName(field.enableWith);

    return this.data.fields.filter(f => {
      if (optionalWithFieldName === f.field) {
        return true;
      }

      if (enableWithFieldName === f.field) {
        return true;
      }

      if (getWithFieldName(f.optionalWith) === referenceFieldName) {
        return true;
      }

      if (getWithFieldName(f.enableWith) === referenceFieldName) {
        return true;
      }

      return false;
    });
  }

  getFileFields() {
    return this.data.fields.filter(f => ['image', 'file'].includes(f.fieldType));
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

  isFieldNameAvailable(name) {
    return !this.data.fields.filter(f => f.field === name).length;
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
    _.get(this, 'data.fields')
      .filter(f => !updatedFieldSlugs.includes(getItemSlug(f)))
      .forEach(fieldToRemove => this.removeField(getItemSlug(fieldToRemove)));

    // add and update
    fields.forEach(f => {
      if (this.getFieldExists(getItemSlug(f))) {
        this.updateField(f);
      } else {
        this.addField(f);
      }
    });

    fields.map((f, i) => this.moveFieldTo(f.slug ?? f.field, i));

    return this.data.fields;
  }

  getValidate(accessType = null, accessLevel = null, options = {}) {
    const args = isObject(accessType) ? {
      accessType: null,
      accessLevel: null,
      options: accessType,
    } : {
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
    const fieldNames = this.data.fields.map(f => f.slug ?? f.field);

    return typeof indexOrSlug === 'string' ? fieldNames.indexOf(indexOrSlug) : indexOrSlug;
  }

  _checkFieldIndex(index, errorMessage = 'Index exceeds schema size') {
    if (index < 0 || index >= this.getFieldCount()) {
      throw errorMessage;
    }
  }

  _popField(index) {
    return this.data.fields.splice(index, 1)[0];
  }
};

module.exports.validate = validate;
