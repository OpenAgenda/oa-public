'use strict';

const _ = require('lodash');

module.exports = async ({ client, index, formatForIndex, operation }, agendas) => {
  const body = agendas.filter(a => {
    if (/(t|T)est/.test(a.title)) return false;
    if (/(t|T)est/.test(a.description)) return false;
    return true;
  }).reduce((bodyItems, agenda) => bodyItems.concat([
    { [operation]: { _id: agenda.uid } },
    operation === 'index' ? formatForIndex(agenda) : { doc: formatForIndex(agenda) }
  ]), []);

  if (!body.length) return 0;

  const result = await client.bulk({
    index,
    body
  });

  return _.get(result, 'body.items', []).length;
}
