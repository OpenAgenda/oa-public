'use strict';

module.exports = ({ knex }) => async function getTagSet(agendaId) {
  return knex('tag_set')
    .first(['store'])
    .where('id', agendaId)
    .then(r => (r?.store ? JSON.parse(r.store) : {
      groups: [{
        required: false,
        unique: false,
        tags: []
      }]
    }));
};
