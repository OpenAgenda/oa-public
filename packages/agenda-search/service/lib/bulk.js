'use strict';

const log = require('@openagenda/logs')('bulk');

module.exports = async ({ client, index, operation }, agendas) => {
  if (!agendas.length) return 0;

  const result = await client.bulk({
    index,
    body: agendas.reduce((carry, agenda) => carry.concat([{
      [operation]: { _id: agenda.uid },
    }, operation === 'index' ? agenda : { doc: agenda }]), [])
  });

  for (const issue of result.body.items.filter(item => item.index.status !== 201)) {
    log('error', `could not bulk index agenda ${issue.index._id}`, issue.index);
  }

  return (result.body.items || []).length;
}
