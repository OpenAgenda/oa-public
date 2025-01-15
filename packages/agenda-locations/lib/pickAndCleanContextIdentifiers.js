'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');

const { BadRequest } = require('@openagenda/verror');

schema.register({ integer });

const validate = schema({
  agendaUid: {
    type: 'integer',
  },
  setUid: {
    type: 'integer',
  },
});

module.exports = (context = {}, fields = []) => {
  const ids = fields
    .filter((field) => context[field] !== null)
    .reduce(
      (identifiers, field) => ({ ...identifiers, [field]: context[field] }),
      {},
    );

  try {
    validate(ids);
    return ids;
  } catch (e) {
    throw new BadRequest('Invalid location identifier', e);
  }
};
