'use strict';

const getMemberSchema = require('./getMemberSchema');

// helper to avoid loading member schema twice
module.exports = async function extractMemberSchema(services, {
  schema,
  includeSplitMemberSchema,
  access,
  agenda,
  actingMember,
}) {
  if (includeSplitMemberSchema) {
    return getMemberSchema(services, agenda, { access, actingMember });
  }

  if (schema) {
    const schemaFromField = schema.fields.find(f => f.field === 'member')?.schema;

    if (schemaFromField) {
      return schemaFromField;
    }
  }

  return (
    await getMemberSchema(services, agenda, { access, actingMember })
  ).merged;
};
