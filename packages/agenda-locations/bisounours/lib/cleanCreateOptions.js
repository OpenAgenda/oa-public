'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');

schema.register({
  integer
});

module.exports = schema({
  context: {
    agendaUid: {
      type: 'integer',
      default: null
    }
  }
});
