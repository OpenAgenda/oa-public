const schema = require('./schema');
const memberSchema = require('./memberSchema');

module.exports = Object.assign(function getFixtures(agendaUid) {
  return { schema, memberSchema };
});
