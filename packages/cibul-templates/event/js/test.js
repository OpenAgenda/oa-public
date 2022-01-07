const utils = require('./additionalFields.utils');

const {
  hasAdditionalFields,
  formatAdditionalFieldData
} = utils;

const eventData = require('../../server/testdata/eventdatawithadditionalfields.json');
const agendaData = require('../../server/testdata/agendawithadditionalfields.json');

// hasAdditionalFields(agendaData.schema)

console.log(formatAdditionalFieldData(agendaData.schema, eventData.event, 'fr'));