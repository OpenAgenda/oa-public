'use strict';

const memberSchema = require('@openagenda/member-apps/dist/components/Form/schema');

module.exports = optionalFields => {
  return memberSchema(optionalFields);
};
