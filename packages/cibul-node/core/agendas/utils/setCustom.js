'use strict';

module.exports = async (customService, formSchemaId, itemUid, data, { agendaId }) => {
  const result = {
    errors: []
  };

  try {
    const options = {
      context: { legacy: false },
      validate: false,
      partial: true // always true, considering that data is already validated
    };

    if (agendaId) {
      options.agendaId = agendaId;
    }

    Object.assign(
      result,
      await customService(formSchemaId).set(itemUid, data, options)
    );
  } catch (errors) {
    result.errors = errors;
  }

  return result;
};
