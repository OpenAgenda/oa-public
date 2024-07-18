import _ from 'lodash';
import ih from 'immutability-helper';
import getSchema from '../getSchema.mjs';

export default async (services, agenda, fieldNames = [], origin = null) => {
  const {
    formSchemas,
  } = services;

  if (!fieldNames.length) {
    return {
      message: 'no fields for which origin needs to be set',
    };
  }

  const schema = await getSchema(services, agenda);

  if (!schema) {
    return {
      message: 'no schema exists for agenda, will not be updated with origin',
    };
  }

  const schemaFieldNames = schema.fields.map(f => f.field);

  const update = fieldNames
    .map(f => schemaFieldNames.indexOf(f))
    .reduce((update2, fieldIndex) => {
      if (fieldIndex === -1) return update2;

      return _.set(update2, `fields.${fieldIndex}.origin`, { $set: origin });
    }, { fields: {} });

  if (!_.keys(update.fields).length) {
    return {
      message: 'no fields found to set the origin on',
    };
  }

  return {
    message: `origin ${origin} set on ${_.keys(update.fields).length} fields`,
    schema: await formSchemas.update(agenda.formSchemaId, ih(schema, update)),
  };
};
