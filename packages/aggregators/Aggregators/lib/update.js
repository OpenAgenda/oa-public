'use strict';

const validate = require('./validate');
const db = require('../db');

module.exports = async (knex, agendaUid, data) => {

  const agendaId = await knex('review').first('id')
    .where('uid', clean.agendaUid)
    .then(r => r ? r.id : null);
}
