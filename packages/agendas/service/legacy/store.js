'use strict';

const column = require('./column');

function update(agendaId, key, value, cb) {
  column.get(agendaId, 'store', (err, storeStr) => {
    if (err) return cb(`could not retrieve store of agenda ${agendaId}`);

    let obj;

    try {
      obj = JSON.parse(storeStr || '{}');
    } catch (e) {
      return cb('parse error');
    }

    obj[key] = value;

    column(agendaId, 'store', JSON.stringify(obj), cb);
  });
}

function get(agendaId, key, cb) {
  column.get(agendaId, 'store', (err, storeStr) => {
    if (err) return cb(`could not retrieve store of agenda ${agendaId}`);

    let obj;

    try {
      obj = JSON.parse(storeStr);
    } catch (e) {
      return cb('parse error');
    }

    cb(null, obj[key]);
  });
}

module.exports = Object.assign(update, { get });
