'use strict';

const log = require('@openagenda/logs')('bulk');

module.exports = async ({ client, index, formatForIndex, operation }, agendas) => {
  const body = [];

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

  return (result.body.items || []).length;
}
