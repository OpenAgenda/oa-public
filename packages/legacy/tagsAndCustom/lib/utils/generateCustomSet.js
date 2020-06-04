"use strict";

const _ = require('lodash');

const legacyAccessType = require('./legacyAccessType');

const log = require('@openagenda/logs')('generateCustomSet');

const schemaToCustom = {
  integer: 'integer',
  number: 'number',
  text: 'text',
  textarea: 'textarea',
  markdown: 'textarea',
  slate: 'textarea',
  html: 'textarea',
  image: 'image',
  file: 'file',
  link: 'url',
  email: 'email',
  checkbox: 'checkbox',
  boolean: 'checkbox',
  phone: 'text',
  radio: 'radio'
}

function isLegacyCustom(field) {
  if (!Object.keys(schemaToCustom).includes(field.fieldType)) {
    return false;
  }
  if ((field.origin === 'custom') || !field.origin) {
    return true;
  }
  return false;
}

module.exports = schema => {
  const messages = [];
  log('processing', JSON.stringify(schema, null, 2));

  const customFields = schema.fields.filter(isLegacyCustom).map(f => {

      if (!f.origin) {
        messages.push(`${f.field}: field origin is not set`);
      }

      const custom = {
        name: f.field,
        type: legacyAccessType(f),
        fieldType: schemaToCustom[f.fieldType],
        optional: !!f.optional,
        label: _multilingualLabel(f.label)
      };

      ['min', 'max']
        .filter(attr => ![undefined, null].includes(f[attr]))
        .forEach(attr => { custom[attr] = f[attr] });

      return custom;

    });

  log('extracted', customFields);

  return {
    customFields,
    messages
  }
}

module.exports.isLegacyCustom = isLegacyCustom;

function _multilingualLabel(label) {
  return _.isString(label) ? {
    fr: label,
    en: label
  } : label;
}


