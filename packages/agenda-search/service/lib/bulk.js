'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('bulk');

module.exports = async ({ client, index, formatForIndex, operation }, agendas) => {
  const body = [];

  const filtered = agendas.filter(a => {
    if (/(t|T)est/.test(a.title)) return false;
    if (/(t|T)est/.test(a.description)) return false;
    return true;
  });

  for (const agenda of agendas) {
    body.push({
      [operation]: { _id: agenda.uid }
    });

    if (operation === 'index') {
      body.push(await formatForIndex(agenda));
    } else {
      body.push({ doc: await formatForIndex(agenda) });
    }

  };

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
