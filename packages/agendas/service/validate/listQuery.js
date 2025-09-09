'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const date = require('@openagenda/validators/date');
const choice = require('@openagenda/validators/choice');
const fields = require('./fields');

const credentialFields = fields
  .find((f) => f.field === 'credentials')
  .fields.reduce(
    (credentials, field) => ({
      ...credentials,
      [field.field]: {
        ...field,
        default: undefined,
      },
    }),
    {},
  );

schema.register({
  integer,
  date,
  choice,
});

module.exports = schema({
  ids: {
    // DEPRECATED
    type: 'integer',
    list: { default: null },
  },
  private: {
    // deprecated
    type: 'boolean',
    nullable: true,
    default: false,
  },
  search: {
    type: 'text',
  },
  id: {
    type: 'integer',
    list: { default: null },
  },
  uid: {
    type: 'integer',
    list: { default: null },
  },
  slug: {
    type: 'text',
    list: { default: null },
  },
  networkUid: {
    type: 'integer',
  },
  memberUserUid: {
    type: 'integer',
  },
  updatedAtGreaterThan: {
    type: 'date',
    default: null,
  },
  idGreaterThan: {
    type: 'integer',
    default: null,
  },
  credentials: {
    type: 'schema',
    fields: credentialFields,
  },
  order: {
    type: 'choice',
    options: [
      'updatedAt.desc',
      'createdAt.desc',
      'updatedAt.asc',
      'updatedAt.desc',
      'id.desc',
      'id.asc',
    ],
    default: null,
    unique: true,
  },
});
