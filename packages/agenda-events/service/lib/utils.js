"use strict";

const camelCase = require('lodash/camelCase');
const snakeCase = require('lodash/snakeCase');

module.exports.toEntry = ae => {
  return Object.keys(ae).reduce((entry, field) => {
    const col = snakeCase(field);
    if (field === 'sourceAgendaUid') {
      entry[col] = JSON.stringify(ae[field]);
    } else {
      entry[col] = ae[field];
    }
    return entry;
  },{});
}

module.exports.fromEntry = entry => {
  return Object.keys(entry).reduce((ae, col) => {
    const field = camelCase(col);
    if (col === 'source_agenda_uid') {
      ae[field] = entry[col] ? JSON.parse(entry[col]) : [];
    } else {
      ae[field] = entry[col];
    }
    return ae;
  },{});
}
