'use strict';

module.exports = function addMemberSchemaToMemberField(schema, memberSchema) {
  if (!memberSchema) {
    return;
  }
  const memberField = schema.fields.find(f => f.field === 'member');

  if (!memberField) {
    return;
  }

  memberField.schema = memberSchema;
};
