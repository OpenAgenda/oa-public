import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

export function toEntry(ae) {
  return Object.keys(ae).reduce((entry, field) => {
    const col = snakeCase(field);
    if (['sourceAgendaUid', 'sourcePaths'].includes(field)) {
      entry.source_agenda_uid = JSON.stringify(ae[field]);
    } else {
      entry[col] = ae[field];
    }
    return entry;
  }, {});
}

export function fromEntry(entry) {
  return Object.keys(entry).reduce((ae, col) => {
    const field = camelCase(col);
    if (col === 'source_agenda_uid') {
      ae.sourcePaths = entry[col] ? JSON.parse(entry[col]) : [];
    } else {
      ae[field] = entry[col];
    }
    return ae;
  }, {});
}
