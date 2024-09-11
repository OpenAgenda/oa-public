const schema = require('./schema.json');
const memberSchema = require('./memberSchema.json');

module.exports = Object.assign(function getFixtures(_agendaUid) {
  return { schema, memberSchema };
});
