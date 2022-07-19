'use strict';

module.exports = ({ knex }) => async function getCategorySet(agendaId) {
  return knex('category_set')
    .first(['store'])
    .where('id', agendaId)
    .then(r => (r?.store ? JSON.parse(r.store) : {
      categories: []
    }));
};
