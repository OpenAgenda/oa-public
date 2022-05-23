const _ = {
  get: require('lodash/get'),
  omit: require('lodash/omit'),
  pick: require('lodash/pick')
};

const isObject = require('./isObject');

const ih = require('immutability-helper');

const {
  extractNextOptionId
} = require('./fieldOptions');

const validateFieldAndAssignOptionIds = require('./validateFieldAndAssignOptionIds');

const getSchema = require('./getSchema');
const getWithFieldName = require('./getWithFieldName');

function validate(data, options = {}) {
  const {
    client,
    requireLabels
  } = {
    client: false,
    requireLabels: true,
    ...(typeof options === 'boolean' ? {
      client: options
    } : options)
  };

  let errors = [];

  let dirty = Object.assign({
    id: null,
    nextOptionId: 1,
    fields: [],
    res: null,
    custom: null,
    defaultLabelLanguage: null
  }, data || {});

  // these we take as is
  const clean = _.pick(dirty, [
    'id',
    'res',
    'custom',
    'defaultLabelLanguage'
  ]);

  clean.nextOptionId = extractNextOptionId(data);

  clean.fields = [];

  // clean each field
  dirty.fields.forEach(f => {
    try {
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
        throw { ...e,
          message: `Validation of field ${f.field} failed: ${e.message}`
        }
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
      ...(typeof options === 'boolean' ? { client: options } : options)
    });
  }

  // get clean data
  getData() {
    return this.data;
  }

  addField(fieldData) {
    const {
      field: clean,
      nextOptionId
    } = validateFieldAndAssignOptionIds(fieldData, _.pick(this.data, [
      'custom', 'defaultLabelLanguage', 'nextOptionId'
    ]));

    if (!this.isFieldNameAvailable(clean.field)) {
      throw 'This field name is taken! : ' + clean.field;
    }

    this.data.nextOptionId = nextOptionId;

    this.data.fields.push(clean);
  }

  updateField(fieldData) {
    const {
      field: clean,
      nextOptionId
    } = validateFieldAndAssignOptionIds(fieldData, _.pick(this.data, [
      'custom', 'defaultLabelLanguage', 'nextOptionId'
    ]));

    const fieldIndex = this._getFieldIndex(clean.field);

    this.data.nextOptionId = nextOptionId;

    this.data.fields.splice(fieldIndex, 1, clean);
  }

  getField(indexOrName) {
    const index = this._getFieldIndex(indexOrName);

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
      } else if (enableWithFieldName == f.field) {
        return true;
      } else if (getWithFieldName(f.optionalWith) === referenceFieldName) {
        return true;
      } else if (getWithFieldName(f.enableWith) === referenceFieldName) {
        return true;
      };
    });
  }

  getFileFields() {
    return this.data.fields.filter(f => ['image', 'file'].includes(f.fieldType));
  }

  moveField(indexOrName, moves) {
    const index = this._getFieldIndex(indexOrName);

    this.moveFieldTo(index, index + moves);
  }

  moveFieldTo(indexOrName, newIndex) {
    const index = this._getFieldIndex(indexOrName);

    this._checkFieldIndex(newIndex, 'Move value exceeds possible value');

    const field = this._popField(index);

    this.data.fields.splice(newIndex, 0, field);
  }

  removeField(indexOrName) {
    const index = this._getFieldIndex(indexOrName);

    this._checkFieldIndex(index);

    this._popField(index);
  }

  isFieldNameAvailable(name) {
    return !this.data.fields.filter(f => f.field == name).length;
  }

  getFieldCount() {
    return this.data.fields.length;
  }

  isEmpty() {
    return !this.data.fields.length;
  }

  isNew() {
    return _isNew(this.data);
  }

  updateFields(fields) {
    console.log('iso FormSchema', fields);
    const updatedFieldsNames = fields.map(f => f.field);

    // remove
    _.get(this, 'data.fields')
      .filter(f => !updatedFieldsNames.includes(f.field))
      .forEach(fieldToRemove => this.removeField(fieldToRemove.field));

    // add and update
    fields.forEach((f, i) => {
      if (this.getFieldExists(f.field)) {
        this.updateField(f);
      } else {
        this.addField(f);
      }
    });

    fields.map((f, i) => this.moveFieldTo(f.field, i));

    return this.data.fields;
  }

  getValidate(accessType = null, accessLevel = null, options = {}) {
    if (isObject(accessType)) {
      options = accessType;
      accessType = null;
    }
    return getSchema(
      this.data.fields,
      accessType,
      accessLevel,
      ih(options, {
        custom: {
          $set: this.data.custom
        }
      })
    );
  }

  getFieldExists(indexOrName) {
    if (typeof indexOrName === 'string') {
      return this._getFieldIndex(indexOrName) === -1 ? false : true;
    }

    return indexOrName < this.data.fields.length;
  }

  _getFieldIndex(indexOrName) {
    const fieldNames = this.data.fields.map(f => f.field);

    return typeof indexOrName === 'string' ? fieldNames.indexOf(indexOrName) : indexOrName;
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

function _isNew(data) {
  return data.id === null;
}
