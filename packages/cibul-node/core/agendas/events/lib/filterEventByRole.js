'use strict';

module.exports = async function filterEventByRole(agenda, event, context = {}) {
  return agenda.schema.fields.reduce((filtered, field) => (
    !Array.isArray(field.read) || field.read.includes(context.member?.role) ? Object.assign(
      filtered,
      {
        [field.field]: event[field.field]
      }
    ) : filtered
  ), {});
};
