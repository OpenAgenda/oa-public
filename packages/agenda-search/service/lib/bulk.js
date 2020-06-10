'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('bulk');

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

  for (const issue of result.body.items.filter(item => item.index.status !== 201)) {
    log('error', `could not bulk index agenda ${issue.index._id}`, issue.index);
  }

  return _.get(result, 'body.items', []).length;
}
